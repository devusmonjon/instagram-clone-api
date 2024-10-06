import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, SentMessageInfo } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailOptions } from './mail.interface';

@Injectable()
export class MailService {
  private transporter: Transporter<SentMessageInfo>;
  constructor(private readonly configService: ConfigService) {
    const smtpOptions: SMTPTransport.Options = {
      host: configService.get<string>('SMTP_HOST'), // SMTP hostini kiriting
      port: Number(configService.get<number>('SMTP_PORT')), // Port (masalan, Gmail uchun 587)
      secure: Boolean(configService.get<boolean>('SMTP_SECURE')), // SSL uchun `true` bo'lsa port 465 bo'lishi kerak
      auth: {
        user: configService.get<string>('SMTP_MAIL'), // Email foydalanuvchi
        pass: configService.get<string>('SMTP_PASSWORD'), // Email parol
      },
    };
    console.log(smtpOptions);

    this.transporter = nodemailer.createTransport(smtpOptions);
  }

  async sendOtpVerification(mail: string): Promise<SentMessageInfo> {
    const mailOptions: MailOptions = {
      from: 'noreply@deepwork.uz', // Sender address
      to: mail, // Receiver address
      subject: 'Subject', // Subject line
      text: 'Hello', // Plain text body
      html: 'Hello', // HTML body (optional)
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

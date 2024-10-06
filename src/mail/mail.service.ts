import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, SentMessageInfo } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailOptions } from './mail.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from './otp.model';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.model';
import { compare, genSalt, hash } from 'bcryptjs';

@Injectable()
export class MailService {
  private transporter: Transporter<SentMessageInfo>;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    const smtpOptions: SMTPTransport.Options = {
      host: configService.get<string>('SMTP_HOST'), // SMTP hostini kiriting
      port: Number(configService.get<number>('SMTP_PORT')), // Port (masalan, Gmail uchun 587)
      secure: Boolean(configService.get<boolean>('SMTP_SECURE')), // SSL uchun `true` bo'lsa port 465 bo'lishi kerak
      auth: {
        user: configService.get<string>('SMTP_MAIL'), // Email foydalanuvchi
        pass: configService.get<string>('SMTP_PASSWORD'), // Email parol
      },
    };

    this.transporter = nodemailer.createTransport(smtpOptions);
  }

  async sendOtpVerification(mail: string): Promise<SentMessageInfo> {
    console.log(mail);

    if (!mail) new ForbiddenException('Email is required');
    const existUser = await this.userModel.findOne({ email: mail });

    if (!existUser) throw new ForbiddenException('User not found');

    const code = Math.floor(100000 + Math.random() * 900000);
    const salt = await genSalt(10);
    const hashedCode = await hash(String(code), salt);

    const expireAt = Date.now() + 5 * 60 * 1000;

    await this.otpModel.create({
      email: mail,
      code: hashedCode,
      expireAt: expireAt,
    });

    const mailOptions: MailOptions = {
      from: 'noreply@deepwork.uz',
      to: mail,
      subject: 'Verification email',
      text: `Your verification code is ${code}`,
      html: `<b>Your verification code is <i>${code}</i><br>Your verification code will expire in ${new Date(
        expireAt,
      ).toUTCString()}.</b>`,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async verifyOtp(email: string, code: string) {
    if (!email) new BadRequestException('Email is required');
    if (!code) new BadRequestException('Verification code is required');

    const existUser = await this.userModel.findOne({ email: email });
    if (!existUser) throw new ForbiddenException('User not found');

    const userExistOtp = await this.otpModel.find({ email: email });
    if (userExistOtp.length === 0)
      throw new ForbiddenException('Otp not found');

    const { expireAt, code: otpCode } = userExistOtp.slice(-1)[0];

    if (expireAt < new Date()) {
      await this.otpModel.deleteMany({ email: email });
      throw new BadRequestException('Code expired');
    }

    const validOtp = await compare(code, otpCode);
    if (!validOtp) throw new BadRequestException('Invalid code');

    await this.otpModel.deleteMany({ email: email });

    return {
      success: true,
      message: 'Email verified',
    };
  }
}

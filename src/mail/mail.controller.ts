import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailOptions } from './mail.interface';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  @Post('send-otp')
  async sendOtp(@Body() { email }: { email: string }) {
    return await this.mailService.sendOtpVerification(email);
  }
}

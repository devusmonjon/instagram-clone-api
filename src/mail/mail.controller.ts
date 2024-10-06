import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailOptions } from './mail.interface';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  @Post('send-otp')
  async sendOtp(@Body() dto: { email: string }) {
    return await this.mailService.sendOtpVerification(dto.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: { email: string; code: string }) {
    return await this.mailService.verifyOtp(dto.email, dto.code);
  }
}

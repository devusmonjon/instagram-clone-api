import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true, collection: 'otps' })
export class Otp {
  @Prop()
  email: string;

  @Prop()
  code: string;

  @Prop()
  expireAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

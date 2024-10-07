import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { RoleUser } from './user.interface';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ unique: true, required: true })
  username: string;

  @Prop({
    unique: false,
    required: false,
    default: '/uploads/profile_not_found.png',
  })
  photo: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, default: false })
  emailActivated: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: [] })
  followers: User[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: [] })
  following: User[];

  @Prop({ required: true, default: 'USER' })
  role: RoleUser;
}

export const UserSchema = SchemaFactory.createForClass(User);

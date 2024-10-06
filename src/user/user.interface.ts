import { UserDocument } from './user.model';

export type RoleUser = 'ADMIN' | 'MODERATOR' | 'USER';
export type UserTypeData = keyof UserDocument;

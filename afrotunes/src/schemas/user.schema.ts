import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './user-role.enum';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true, default: () => uuidv4() })
  userId: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  userPassword: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ required: true, enum: ['male', 'female'] })
  gender: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: false })
  status: boolean;

  @Prop()
  verificationCode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

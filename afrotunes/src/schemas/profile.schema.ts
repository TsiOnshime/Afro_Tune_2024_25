import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Profile extends Document {
  @Prop({ required: true, unique: true })
  email: string; // Link profile to logged-in user

  @Prop({ required: true })
  artist: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ required: true })
  genre: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: Buffer })
  imageData: Buffer;

  @Prop({ required: true })
  imageContentType: string;

  @Prop({ default: Date.now })
  uploadDate: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

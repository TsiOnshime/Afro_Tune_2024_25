// announcement.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Announcement extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  tag: string; 
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

// comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Comment extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, ref: 'Announcement', required: true }) 
  announcementId: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

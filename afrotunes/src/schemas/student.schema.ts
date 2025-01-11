import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Student extends Document {
  @Prop({ required: true })
  studentId: string;

  @Prop({ required: true })
  studentPassword: string;

  @Prop({ default: false })
  used: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

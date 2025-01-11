import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Song extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  artist: string;

  @Prop({ required: true })
  album: string;

  @Prop({ required: true })
  genre: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: Buffer })
  songData: Buffer;

  @Prop({ required: true })
  songContentType: string;

  @Prop({ required: true, type: Buffer })
  imageData: Buffer;

  @Prop({ required: true })
  imageContentType: string;

  @Prop({ default: Date.now })
  uploadDate: Date;
}

export const SongSchema = SchemaFactory.createForClass(Song);

// Create compound index for title and artist
SongSchema.index({ title: 1, artist: 1 }, {
  unique: true,
  collation: { locale: 'en', strength: 2 } // Case-insensitive unique index
});
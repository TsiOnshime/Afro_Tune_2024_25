import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSongDto {
  @ApiProperty({ example: 'My Song' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Artist Name' })
  @IsString()
  @IsNotEmpty()
  artist: string;

  @ApiProperty({ example: 'Album Name' })
  @IsString()
  @IsNotEmpty()
  album: string;

  @ApiProperty({ example: 'Pop' })
  @IsString()
  @IsNotEmpty()
  genre: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  songData: Buffer;

  @ApiProperty({ type: 'string' })
  songContentType: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  imageData: Buffer;

  @ApiProperty({ type: 'string' })
  imageContentType: string;
}
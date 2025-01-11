import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsOptional, IsString} from "class-validator";



export class CreateProfileDto {

  @ApiProperty({ example: 'Artist Name' })
  @IsString()
  @IsNotEmpty()
  artist: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  imageData: Buffer;

  @ApiProperty({ type: 'string' })
  imageContentType: string;
}
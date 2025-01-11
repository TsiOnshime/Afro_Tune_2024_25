import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UploadedFiles,
  UseInterceptors,
  Res,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SongsService } from './songs.service';
import { CreateSongDto } from 'src/dto/create-songeDto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}


  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'song', maxCount: 1 },
        { name: 'image', maxCount: 1 }
      ])
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        artist: { type: 'string' },
        album: { type: 'string' },
        genre: { type: 'string' },
        description: { type: 'string' },
        song: { type: 'string', format: 'binary' },
        image: { type: 'string', format: 'binary' }
      }
    }
  })
  async uploadSong(
      @Body() createSongDto: CreateSongDto,
      @UploadedFiles() files: { song?: Express.Multer.File[]; image?: Express.Multer.File[] }
  ) {
    if (!files?.song?.[0] || !files?.image?.[0]) {
      throw new BadRequestException('Both song and image files are required');
    }

    const songFile = files.song[0];
    const imageFile = files.image[0];

    try {
      const result = await this.songsService.create({
        ...createSongDto,
        songData: songFile.buffer,
        songContentType: songFile.mimetype,
        imageData: imageFile.buffer,
        imageContentType: imageFile.mimetype
      });

      return {
        success: true,
        message: 'Song uploaded successfully',
        data: {
          id: result._id,
          title: result.title,
          artist: result.artist
        }
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }




  @Get()
  @ApiOperation({ summary: 'Get all songs' })
  async getAllSongs() {
    return this.songsService.findAll();
  }

  @Get('stream/:id')
  @ApiOperation({ summary: 'Stream song audio' })
  async streamSong(@Param('id') id: string, @Res() res: Response) {
    const song = await this.songsService.findById(id);
    if (!song) {
      throw new NotFoundException('Song not found');
    }

    res.set({
      'Content-Type': song.songContentType,
      'Content-Disposition': `inline; filename="${song.title}.mp3"`,
    });

    res.send(song.songData);
  }

  @Get('image/:id')
  @ApiOperation({ summary: 'Get song image' })
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const song = await this.songsService.findById(id);
    if (!song) {
      throw new NotFoundException('Song not found');
    }

    res.set({
      'Content-Type': song.imageContentType,
      'Content-Disposition': `inline; filename="${song.title}-image"`,
    });

    res.send(song.imageData);
  }

  @Get('search/title')
  @ApiOperation({ summary: 'Search songs by title' })
  async getSongsByTitle(@Query('title') title: string) {
    if (!title) {
      throw new BadRequestException('Title query parameter is required');
    }
    return this.songsService.findByTitle(title);
  }

  @Get('artist/:artist')
  @ApiOperation({ summary: 'Get songs by artist name' })
  async getSongsByArtist(@Param('artist') artist: string) {
    if (!artist) {
      throw new BadRequestException('Artist parameter is required');
    }
    return this.songsService.findByArtist(artist);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get song by ID' })
  async getSongById(@Param('id') id: string) {
    const song = await this.songsService.findById(id);
    if (!song) {
      throw new NotFoundException('Song not found');
    }
    return song;
  }
}






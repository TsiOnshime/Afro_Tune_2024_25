import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Song } from 'src/schemas/song.schema';
import { CreateSongDto } from 'src/dto/create-songeDto';

@Injectable()
export class SongsService {
  constructor(@InjectModel(Song.name) private readonly songModel: Model<Song>) {}



  async create(data: CreateSongDto & {
    songData: Buffer;
    songContentType: string;
    imageData: Buffer;
    imageContentType: string;
  }): Promise<Song> {
    try {
      const newSong = new this.songModel({
        title: data.title,
        artist: data.artist,
        album: data.album,
        genre: data.genre,
        description: data.description,
        songData: data.songData,
        songContentType: data.songContentType,
        imageData: data.imageData,
        imageContentType: data.imageContentType,
        uploadDate: new Date()
      });

      return await newSong.save();
    } catch (error) {
      throw new BadRequestException(`Failed to save song: ${error.message}`);
    }
  }
  //
  //
  //
  // async create(songData: CreateSongDto): Promise<Song> {
  //   try {
  //     const existingSong = await this.songModel.findOne({
  //       title: songData.title,
  //       artist: songData.artist
  //     }).exec();
  //
  //     if (existingSong) {
  //       throw new BadRequestException('Song with this title and artist already exists');
  //     }
  //
  //     const newSong = new this.songModel({
  //       ...songData,
  //       uploadDate: new Date()
  //     });
  //
  //     return await newSong.save({
  //       w: 'majority',
  //       wtimeout: 30000,
  //       j: true
  //     });
  //
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new BadRequestException(`Failed to save song: ${error.message}`);
  //   }
  // }
  //
  //








  async findAll(): Promise<Song[]> {
    return this.songModel.find()
        .select('-songData -imageData') // Exclude binary data for list
        .sort({ uploadDate: -1 })
        .exec();
  }

  async findById(id: string): Promise<Song> {
    const song = await this.songModel.findById(id).exec();
    if (!song) {
      throw new NotFoundException('Song not found');
    }
    return song;
  }

  async findByTitle(title: string): Promise<Song[]> {
    return this.songModel.find({
      title: { $regex: title, $options: 'i' }
    })
        .select('-songData -imageData') // Exclude binary data for list
        .sort({ uploadDate: -1 })
        .exec();
  }

  async findByArtist(artist: string): Promise<Song[]> {
    return this.songModel.find({
      artist: { $regex: artist, $options: 'i' }
    })
        .select('-songData -imageData') // Exclude binary data for list
        .sort({ uploadDate: -1 })
        .exec();
  }

  // Helper method to get just the song data
  async getSongData(id: string): Promise<{ data: Buffer; contentType: string }> {
    const song = await this.songModel
        .findById(id)
        .select('songData songContentType')
        .exec();

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    return {
      data: song.songData,
      contentType: song.songContentType
    };
  }

  // Helper method to get just the image data
  async getImageData(id: string): Promise<{ data: Buffer; contentType: string }> {
    const song = await this.songModel
        .findById(id)
        .select('imageData imageContentType')
        .exec();

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    return {
      data: song.imageData,
      contentType: song.imageContentType
    };
  }
}


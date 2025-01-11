import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile} from 'src/schemas/profile.schema'
import {CreateProfileDto} from "../dto/create-profile.dto";
import {SongsService} from "../song/songs.service";
import {exec} from "child_process";


@Injectable()
export class ProfileService {
  constructor(@InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
              private readonly songService: SongsService,
              ) {}

  async create(data: CreateProfileDto & {
    email: string;
    imageData: Buffer;
    imageContentType: string;
  }): Promise<Profile> {
    try {
      const existingProfile = await this.profileModel.findOne({ email: data.email });
      if (existingProfile) {
        throw new BadRequestException('Artist already has a profile.');
      }

      const newArtistProfile = new this.profileModel({
        artist: data.artist,
        email:data.email,
        bio: data.bio,
        genre: data.genre,
        description: data.description,
        imageData: data.imageData,
        imageContentType: data.imageContentType,
        uploadDate: new Date(),
      });

      return await newArtistProfile.save();
    } catch (error) {
      throw new BadRequestException(`Failed to save profile: ${error.message}`);
    }
  }

  async findByArtist(artist: string): Promise<Profile> {
    return this.profileModel
        .findOne({ email: artist }) // Use email instead of artist// Exclude binary data for performance
        .exec();
  }



  async updateProfileByEmail(
      email: string,
      data: CreateProfileDto & {
        imageData: Buffer;
        imageContentType: string;
      },
  ): Promise<Profile> {
    try {
      const existingProfile = await this.profileModel.findOne({email});
      if (!existingProfile) {
        throw new NotFoundException('Profile not found.');
      }

      // Update the existing profile with new data
      existingProfile.artist = data.artist;
      existingProfile.bio = data.bio;
      existingProfile.genre = data.genre;
      existingProfile.description = data.description;
      existingProfile.imageData = data.imageData;
      existingProfile.imageContentType = data.imageContentType;
      existingProfile.uploadDate = new Date();

      return await existingProfile.save();
    } catch (error) {
      throw new BadRequestException(`Failed to update profile: ${error.message}`);
    }
  }





  // Find profile by artist and get associated songs
  async findProfileWithSongs(artist: string): Promise<any> {
    // Find profile by artist (can be by email or artist name)
    const profile = await this.profileModel.findOne({ artist }).exec();

    if (!profile) {
      throw new NotFoundException('Profile not found for this artist');
    }

    // Get songs associated with the artist
    const songs = await this.songService.findByArtist(artist);

    return {
      profile,
      songs,
    };
  }





}

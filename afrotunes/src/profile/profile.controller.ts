import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Req,
  UseGuards,
  BadRequestException, Get, Param, NotFoundException, Put,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { AuthGuard } from 'src/guard/auth.guard';
import {ApiTags, ApiConsumes, ApiBearerAuth, ApiResponse} from '@nestjs/swagger';
import {Profile} from "../schemas/profile.schema";

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {
  }

  @Post('upload')
  @UseGuards(AuthGuard) // Use the custom AuthGuard
  @ApiBearerAuth() // For Swagger documentation
  @ApiConsumes('multipart/form-data') // For file uploads
  @UseInterceptors(
      FileFieldsInterceptor([
        {name: 'imageData', maxCount: 1}, // Updated to 'imageData'
      ]),
  )
  async uploadProfile(
      @Req() req: any, // Use `any` to access custom fields added by AuthGuard
      @Body() createProfileDto: CreateProfileDto,
      @UploadedFiles() files: { imageData?: Express.Multer.File[] }, // Updated to 'imageData'
  ) {
    const decodedData = req.decodedData;

    if (!decodedData) {
      throw new BadRequestException('Unable to validate user credentials.');
    }

    const {role, id, email} = decodedData;

    // Log for debugging
    console.log('Decoded Data:', decodedData);
    console.log('User Role:', role);

    // Validate the uploaded image
    if (!files?.imageData?.[0]) {
      throw new BadRequestException('Image file is required.');
    }

    const imageFile = files.imageData[0];

    // Merge the DTO with the decoded token data
    const profileData = {
      ...createProfileDto, // Include fields like bio, genre, etc.
      userId: id, // Add userId from decoded token
      email: email, // Use email from decoded token
      imageData: imageFile.buffer,
      imageContentType: imageFile.mimetype,
    };

    console.log('Profile Data:', profileData); // Log to check merged data

    try {
      // Create the profile using the service
      const result = await this.profileService.create(profileData);

      return {
        success: true,
        message: 'Profile uploaded successfully',
        data: {
          email: result.email,
          bio: result.bio,
          genre: result.genre,
          description: result.description,
        },
      };
    } catch (error) {
      console.error('Error while saving profile:', error);
      throw new BadRequestException('Failed to save profile: ' + error.message);
    }


  }


  @Put('updateprofile/:email') // Include email in the URL
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'imageData', maxCount: 1 }, // Handle image upload
      ]),
  )
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfileByEmail(
      @Param('email') email: string, // Get email from URL path
      @Body() createProfileDto: CreateProfileDto,
      @UploadedFiles() files: { imageData?: Express.Multer.File[] },
  ) {
    const imageFile = files?.imageData?.[0];
    if (!imageFile) {
      throw new BadRequestException('Image file is required.');
    }

    const updatedProfileData = {
      ...createProfileDto,
      imageData: imageFile.buffer,
      imageContentType: imageFile.mimetype,
    };

    const updatedProfile = await this.profileService.updateProfileByEmail(
        email,
        updatedProfileData,
    );

    if (!updatedProfile) {
      throw new NotFoundException('Profile not found for the given email');
    }

    return {
      success: true,
      message: 'Profile updated successfully',

    };
  }
  // Endpoint to get a profile by artist email
  @Get(':email')
  // Optional: Add this if authentication is required
  @ApiResponse({status: 200, description: 'Profile found', type: Profile})
  @ApiResponse({status: 404, description: 'Profile not found'})
  async findByArtist(@Param('email') email: string): Promise<Profile> {
    const profile = await this.profileService.findByArtist(email);

    if (!profile) {
      throw new NotFoundException('Profile not found for this artist');
    }

    return profile;
  }

  @Get(':email/songs')
  @ApiBearerAuth() // Optional: Add this if authentication is required
  @ApiResponse({status: 200, description: 'Profile and songs found', type: Object})
  @ApiResponse({status: 404, description: 'Profile not found or songs not found'})
  async findProfileWithSongs(@Param('email') email: string): Promise<any> {
    const result = await this.profileService.findProfileWithSongs(email);

    if (!result.profile) {
      throw new NotFoundException('Profile not found for this artist');
    }

    return result;
  }



}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Profile, ProfileSchema } from 'src/schemas/profile.schema';
import { AuthModule } from '../auth/auth.module';
import {SongsService} from "../song/songs.service";
import {SongsModule} from "../song/songs.module"; // Import AuthModule

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
    ]),
    AuthModule,
    SongsModule,
    // Include AuthModule here
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],

})
export class ProfileModule {}

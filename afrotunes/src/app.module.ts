import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import {SongsModule} from "./song/songs.module";
import {ProfileModule} from "./profile/profie.module";




// @ts-ignore
// @ts-ignore
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // Register the default JWT strategy
    JwtModule.register({

      secret: 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/afrotune'),
    AuthModule,
    SongsModule,
    ProfileModule,


  ],
  controllers: [AppController],
  providers: [

    AppService,

  ],
})
export class AppModule {}
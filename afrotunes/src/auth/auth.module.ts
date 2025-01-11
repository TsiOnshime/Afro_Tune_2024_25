import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
//import { MailerModule } from '@nestjs-modules/mailer';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../schemas/user.schema';

import { Student, StudentSchema } from 'src/schemas/student.schema';
import { Profile, ProfileSchema } from 'src/schemas/profile.schema';
import {MailerModule} from "@nestjs-modules/mailer";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema}]),
    
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '2d' },
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'abrhamwube1@gmail.com',
          pass: 'bzpj czdo iynt izgg',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
    }),

  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}

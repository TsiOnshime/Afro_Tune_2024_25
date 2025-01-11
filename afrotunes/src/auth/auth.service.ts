import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { VerifyEmailDto } from 'src/dto/verify-email.dto';
import { User } from 'src/schemas/user.schema';
import { Student } from 'src/schemas/student.schema';
import * as jwt from 'jsonwebtoken';
import { UserRole } from 'src/schemas/user-role.enum';
import { CreateProfileDto } from 'src/dto/create-profile.dto';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';
import { Profile } from 'src/schemas/profile.schema';

@Injectable()
export class AuthService {
  constructor(
  //  @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async onModuleInit() {
    await this.createSuperAdmin();
  }
  async register(createUserDto: CreateUserDto): Promise<User> {
    const { userPassword, email,dateOfBirth,gender,fullName} = createUserDto;

    // Check if the email and password are valid and 'used' status is false
    const user = await this.userModel.findOne({ email, used: false });
    if (user) {
      throw new HttpException('email ID is already used', HttpStatus.BAD_REQUEST);
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create a new user with a hashed password
    const newUser = new this.userModel({
      ...createUserDto,
      fullName:fullName,
      dateOfBirth:dateOfBirth,
      gender:gender,
      userPassword: hashedPassword,
      status: true,
      used: true, // Mark this new user's email as used
    });

    await newUser.save();

    return newUser;
  }


  async sendVerificationCode(email: string): Promise<string> {
    const verificationCode = this.generateVerificationCode();
    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is ${verificationCode}`,
    });
    return verificationCode;
  }

  async verifyEmailCode(verifyEmailDto: VerifyEmailDto): Promise<boolean> {
    const { email, code } = verifyEmailDto;
    const user = await this.userModel.findOne({ email, verificationCode: code });
    if (user) {
      user.status = true;
      await user.save();
      return true;
    }
    return false;
  }
  async generateJwtToken(user: User): Promise<string> {
    
    
    const payload = {
      email: user.email,
      role: user.role, // Include the user's role
     
    };
    const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
    return token;
  }
  
generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  async verifyUser(email: string, password: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email, status: true });
    if (user && await bcrypt.compare(password, user.userPassword)) {
      return true;
    }
    return false;
  }

  async sendPasswordResetEmail(email: string, verificationCode: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Verification Code',
      text: `Your password reset verification code is: ${verificationCode}`,
    });
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decodedToken = this.jwtService.verify(token);
      
      const { email, role } = decodedToken;
      console.log(decodedToken)
  
     
      return { email, role};
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email });
  }

  // New methods for superadmin functionalities
  // async changeUserRole(userId: string, newRole: UserRole): Promise<User> {
  //   const user = await this.userModel.findById(userId);
  //   if (!user) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //   }
  //   user.role = newRole;
  //   return user.save();
  // }






  async changeUserRole(userId: string, newRole: UserRole): Promise<User> {
    const user = await this.userModel.findOne({ userId }); // Find by userId (UUID)
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.role = newRole;
    return user.save();
  }










  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.deleteOne({ userId: userId });
    if (result.deletedCount === 0) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
  async createProfile(token: string, createProfileDto: CreateProfileDto): Promise<Profile> {
    try {
      // Validate the token to extract the user's email
      const decodedToken = await this.validateToken(token);
      const userEmail = decodedToken.email;
  
      // Find the user based on the email
      const user = await this.userModel.findOne({ email:userEmail });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      // Create a new profile
      const newProfile = new this.profileModel({
        ...createProfileDto,

        user: user._id, // Set user field to user's _id
      });
  
      return newProfile.save();
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create profile.', HttpStatus.BAD_REQUEST);
    }
  }
  async updateProfile(token: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    try {
      const decodedToken = await this.validateToken(token);
      const userEmail = decodedToken.email;
  
      // Find the user based on the email
      const user = await this.userModel.findOne({ email: userEmail });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      // Find the profile based on the user's _id
      const profile = await this.profileModel.findOne({ user: user._id });
      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }
  
      // Update the profile fields
      Object.assign(profile, updateProfileDto);
      return profile.save();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  
  // async getProfile(token: string): Promise<Profile | undefined> {
  //   try {
  //     // Validate the token to extract the user's email
  //     const decodedToken = await this.validateToken(token);
  //     const userEmail = decodedToken.email;
  
  //     // Fetch the profile associated with the user's email
  //     const profile = await this.profileModel.findOne({ user: userEmail });
  
  //     return profile;
  //   } catch (error) {
  //     // Handle errors, such as token validation failure
  //     console.log('Error fetching profile:', error.message);
  //     return undefined;
  //   }
  // }
  
  async getProfile(token: string): Promise<Profile | undefined> {
    try {
      // Validate the token to extract the user's email
      const decodedToken = await this.validateToken(token);
      const userEmail = decodedToken.email;

      // Find the profile based on the user's email
      const user = await this.userModel.findOne({ email: userEmail });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      // Fetch the profile associated with the user's ObjectId
      const profile = await this.profileModel.findOne({ user: user._id });
  
      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }
  
      return profile;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to fetch profile.', HttpStatus.BAD_REQUEST);
    }
  }
  
  async resetPassword(email: string): Promise<void> {
    // Generate a verification code
    const verificationCode = this.generateVerificationCode();
  
    // Update user's verification code in the database
    await this.userModel.updateOne({ email }, { verificationCode });
  
    // Send password reset email with verification code
    await this.sendPasswordResetEmail(email, verificationCode);
  }
  

  async getUserId(token: string): Promise<string> {
    try {
      // Verify the token and explicitly typecast it
      const decodedToken = this.jwtService.verify(token) as { email: string } | undefined;

      if (!decodedToken || typeof decodedToken.email !== 'string') {
        throw new UnauthorizedException('Invalid token');
      }

      const userEmail = decodedToken.email;

      // Find the user based on the email
      const user = await this.userModel.findOne({ email: userEmail });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user._id.toString(); // Assuming user._id is of type ObjectId, convert to string
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }


  async createSuperAdmin() {
    const superAdminEmail = 'yediworku@gmail.com';
    const superAdminGender="female";
    const superAdminDataOfBirth="1990-01-01";

    const superAdminPassword = "pass"
    const superAdminName = 'yedi';

    // Check if the superadmin user already exists
    const existingUser = await this.userModel.findOne({ email: superAdminEmail });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      const superAdmin = new this.userModel({
        fullName: superAdminName,
        email: superAdminEmail,

        gender:superAdminGender,
        dateOfBirth:superAdminDataOfBirth,

         // You might need to adjust this field
        userPassword: hashedPassword, // You might need to adjust this field
        role: UserRole.SUPER_ADMIN,
        status: true,
      });
      await superAdmin.save();
      console.log('SuperAdmin user created successfully');
    } else {
      console.log('SuperAdmin user already exists');
    }
  }

  async registerArtist(createUserDto: CreateUserDto) :Promise<User> {
    const { userPassword, email,dateOfBirth,gender,fullName} = createUserDto;

    // Check if the email and password are valid and 'used' status is false
    const user = await this.userModel.findOne({ email, used: false });
    if (user) {
      throw new HttpException('email ID is already used', HttpStatus.BAD_REQUEST);
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create a new user with a hashed password
    const newUser = new this.userModel({
      ...createUserDto,
      fullName:fullName,
      dateOfBirth:dateOfBirth,
      gender:gender,
      userPassword: hashedPassword,
      role: UserRole.ARTIST,
      status: true,
      used: true, // Mark this new user's email as used
    });

    await newUser.save();

    return newUser;
  }

  }




import { Controller, Post, Body, HttpException, HttpStatus, Put, Delete, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { VerifyEmailDto } from 'src/dto/verify-email.dto';
import { LoginDto } from 'src/dto/login.dto';
import { VerifyEmailResponseDto } from 'src/dto/verify-email-response.dto'; // Import the new DTO
import { User } from 'src/schemas/user.schema';
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/guard/roles.decorator';
import { UserRole } from 'src/schemas/user-role.enum';
import { ChangeRoleDto } from 'src/dto/change-role.dto';
import { CreateProfileDto } from 'src/dto/create-profile.dto';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';
import { AuthenticatedGuard } from 'src/guard/auth2.guard';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully registered.' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const newUser = await this.authService.register(createUserDto);
      return { message: 'User registered successfully. Verification code sent to your email.' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }





  @Post('register-artist')
  @UseGuards(AuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new artist' })
  @ApiResponse({ status: 201, description: 'The artist has been successfully registered.' })
  @ApiBody({ type: CreateUserDto })
  async registerArtist(@Body() createUserDto: CreateUserDto) {
    try {
      const newUser = await this.authService.registerArtist(createUserDto);
      return { message: 'Artist registered successfully. Verification code sent to your email.' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }










  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with verification code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.', type: VerifyEmailResponseDto })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmailCode(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string; token: string }> {
    try {
      const isVerified = await this.authService.verifyEmailCode(verifyEmailDto);
      if (isVerified) {
        const user = await this.authService.findByEmail(verifyEmailDto.email);
        if (!user) {
          throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
        }
        const token = await this.authService.generateJwtToken(user);
        return { message: 'Email verified successfully.', token };
      } else {
        throw new HttpException('Invalid verification code or email.', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    try {
      const { email, userPassword } = loginDto;
      // Verify if the user exists and is verified
      const isvalidUser = await this.authService.verifyUser(email, userPassword);
      if (!isvalidUser) {
        throw new HttpException('Invalid email or password.', HttpStatus.UNAUTHORIZED);
      }

      // Get the user from your database or another source
      const user: User = await this.authService.findByEmail(email);

      // Generate JWT token if user is valid
      const token = await this.authService.generateJwtToken(user);
      return { accessToken: token };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }


    
}

// @Put('role')
// @UseGuards(AuthGuard)
// @Roles(UserRole.SUPER_ADMIN)
// @ApiOperation({ summary: 'Change user role' })
// @ApiBearerAuth()
// @ApiResponse({ status: 200, description: 'User role updated successfully.' })
// async changeUserRole(@Body() changeRoleDto: ChangeRoleDto) {
//   try {
//     const updatedUser = await this.authService.changeUserRole(changeRoleDto.userId, changeRoleDto.newRole);
//
//     return { message: 'User role updated successfully.', user: updatedUser };
//
//   } catch (error) {
//     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
//   }
// }




  @Put('role')
  @UseGuards(AuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Change user role' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User role updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async changeUserRole(@Body() changeRoleDto: ChangeRoleDto) {
    try {
      const updatedUser = await this.authService.changeUserRole(
          changeRoleDto.userId,
          changeRoleDto.newRole,
      );
      return { message: 'User role updated successfully.', user: updatedUser };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }











  @Delete(':userId')
//@UseGuards(AuthGuard)
//@Roles(UserRole.SUPER_ADMIN)
@ApiOperation({ summary: 'Delete a user' })
@ApiBearerAuth()
@ApiResponse({ status: 200, description: 'User deleted successfully.' })
async deleteUser(@Param('userId') userId: string) {
  try {
    await this.authService.deleteUser(userId);
    return { message: 'User deleted successfully.' };
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

@Get()
@UseGuards(AuthGuard)
@Roles(UserRole.SUPER_ADMIN)
@ApiOperation({ summary: 'Get all users' })
@ApiBearerAuth()
@ApiResponse({ status: 200, description: 'Successfully retrieved users.' })
async getAllUsers() {
  try {
    const users = await this.authService.getAllUsers();
    return { users };
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

@Post('profile')
@UseGuards(AuthenticatedGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Create user profile' })
@ApiResponse({ status: 201, description: 'Profile created successfully.' })
@ApiBody({ type: CreateProfileDto })
async createProfile(@Body() createProfileDto: CreateProfileDto, @Req() req) {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the authorization header
    const profile = await this.authService.createProfile(token, createProfileDto);
    return { message: 'Profile created successfully.', profile };
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

@Put('profile')
@UseGuards(AuthenticatedGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Update user profile' })
@ApiResponse({ status: 200, description: 'Profile updated successfully.' })
@ApiBody({ type: UpdateProfileDto })
async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Req() req) {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the authorization header
    const profile = await this.authService.updateProfile(token, updateProfileDto);
    return { message: 'Profile updated successfully.', profile };
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}


@Get('profile')
@UseGuards(AuthenticatedGuard)
// @Roles(UserRole.USER)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get profile of logged in user' })
@ApiResponse({ status: 200, description: 'Successfully retrieved user profile.' })
async getProfile(@Req() req) {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the authorization header
    const profile = await this.authService.getProfile(token);
    if (!profile) {
      throw new HttpException('Profile not found.', HttpStatus.NOT_FOUND);
    }
    return { profile };
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}
@Post('reset-password')
@ApiOperation({ summary: 'Reset password through email verification' })
@ApiResponse({ status: 200, description: 'Password reset email sent successfully.' })
@ApiBody({ type: ResetPasswordDto })
async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  try {
    const { email } = resetPasswordDto;
    // Check if user exists with the provided email
    const user = await this.authService.findByEmail(email);
    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }
    // Generate a verification code and send it to the user's email
    const verificationCode = await this.authService.generateVerificationCode();
    await this.authService.sendPasswordResetEmail(email, verificationCode);
    return { message: 'Password reset email sent successfully.' };
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}


@Get('userid')
@UseGuards(AuthenticatedGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get user ID of authenticated user' })
@ApiResponse({ status: 200, description: 'Successfully retrieved user ID.' })
async getUserId(@Req() req): Promise<{ userId: string }> {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the authorization header
    const userId = await this.authService.getUserId(token);
    return { userId };
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

}

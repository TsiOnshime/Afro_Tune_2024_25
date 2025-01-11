import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {


  @ApiProperty({ example: 'john.doe@example.com', description: 'Email of the user' })
  readonly email: string;

  @ApiProperty({ example: 'password123', description: 'Password of the user' })
  readonly userPassword: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  readonly fullName: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of birth of the user' })
  readonly dateOfBirth: string;

  @ApiProperty({ example: 'male', description: 'Gender of the user', enum: ['male', 'female'] })
  readonly gender: string;
}

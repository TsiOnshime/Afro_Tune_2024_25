import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email of the user' })
  readonly email: string;

  @ApiProperty({ example: 'password123', description: 'Password of the user' })
  readonly userPassword: string;
}

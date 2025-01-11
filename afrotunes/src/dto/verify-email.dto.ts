import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email of the user' })
  readonly email: string;

  @ApiProperty({ example: '123456', description: 'Verification code' })
  readonly code: string;
}

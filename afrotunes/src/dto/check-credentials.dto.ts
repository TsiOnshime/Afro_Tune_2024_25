import { ApiProperty } from '@nestjs/swagger';

export class CheckCredentialsDto {
  @ApiProperty({ example: 'student123', description: 'The unique ID of the student' })
  readonly studentId: string;

  @ApiProperty({ example: 'schoolpassword', description: 'The password for the student' })
  readonly studentPassword: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'student123', description: 'The unique ID of the student' })
  readonly studentId: string;

  @ApiProperty({ example: 'schoolpassword', description: 'The password for the student' })
  readonly studentPassword: string;

  @ApiProperty({ example: false, description: 'Whether the student ID has been used', default: false })
  readonly used?: boolean;
}

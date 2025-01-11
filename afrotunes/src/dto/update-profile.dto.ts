import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user', required: false })
  readonly fullName?: string;

  @ApiProperty({ example: 'Computer Science', description: 'Field of study', required: false })
  readonly fieldOfStudy?: string;

  @ApiProperty({ example: 'This is a bio', description: 'Bio of the user', required: false })
  readonly bio?: string;

  @ApiProperty({ example: 'http://example.com/profile.jpg', description: 'Profile picture URL', required: false })
  readonly profilePicture?: string;
}

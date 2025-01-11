import { ApiProperty } from '@nestjs/swagger';


export class ResetPasswordDto {
  @ApiProperty({ example: 'example@email.com' })
//   @IsEmail()
  email: string;
}

// // src/dto/change-role.dto.ts
// import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/schemas/user-role.enum';


export class ChangeRoleDto {

  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  userId: string;


  @ApiProperty({ example: UserRole.ARTIST, enum: UserRole })
  newRole: UserRole;
}

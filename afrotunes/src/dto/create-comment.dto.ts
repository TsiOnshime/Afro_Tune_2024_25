// create-comment.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({ description: 'Content of the comment' })
    readonly content: string;

    @ApiProperty({ description: 'User ID associated with the comment' })
    readonly userId: string;

    @ApiProperty({ description: 'Announcement ID associated with the comment' })
    readonly announcementId: string;
}

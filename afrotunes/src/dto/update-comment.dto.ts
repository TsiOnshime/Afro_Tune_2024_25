// update-comment.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommentDto {
    @ApiPropertyOptional({ description: 'Updated content of the comment' })
    content?: string;

    @ApiPropertyOptional({ description: 'Updated user ID associated with the comment' })
    userId?: string;

    @ApiPropertyOptional({ description: 'Updated announcement ID associated with the comment' })
    announcementId?: string;
}

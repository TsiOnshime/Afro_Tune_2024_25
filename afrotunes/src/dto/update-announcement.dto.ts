// update-announcement.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnnouncementDto {
    @ApiProperty({ description: 'Title of the announcement' })
    readonly title?: string;

    @ApiProperty({ description: 'Content of the announcement' })
    readonly content?: string;

    @ApiProperty({ description: 'Category of the announcement' })
    readonly category?: string;

    @ApiProperty({ description: 'Summary of the announcement' })
    readonly summary?: string;

    @ApiProperty({ description: 'Date of the announcement' })
    readonly date?: Date;

    @ApiProperty({ description: 'Image URL of the announcement' })
    readonly image?: string;

    @ApiProperty({ description: 'Tags associated with the announcement' })
    readonly tag?: string;
}
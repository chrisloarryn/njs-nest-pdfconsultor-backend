import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { CommentDTO } from './comment.dto';

export class PostDetailDTO {
	@IsNumber()
	@IsNotEmpty()
	@ApiProperty()
	userId: number;

	@IsNumber()
	@IsNotEmpty()
	@ApiProperty()
	id: number;

	@IsString()
	@ApiProperty()
	title: string;

	@IsString()
	@ApiProperty()
	body: string;

	@IsArray()
	comments: CommentDTO[];
}

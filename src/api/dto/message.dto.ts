import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { PostDTO, UniversityDTO } from './../dto';

export class MessageDTO {
	@IsArray()
	@ApiProperty()
	posts: PostDTO[];

	@IsArray()
	@ApiProperty()
	universities: UniversityDTO[];
}

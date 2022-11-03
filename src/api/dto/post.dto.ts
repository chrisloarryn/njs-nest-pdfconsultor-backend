import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class PostDTO {
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
}

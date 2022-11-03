import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, IsNotEmpty, IsString, IsArray } from 'class-validator';

export class UniversityDTO {
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	country: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	name: string;

	@IsArray()
	@ApiProperty()
	domains: [string];
}

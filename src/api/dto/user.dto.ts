import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UserDTO {
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	usr_name: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	usr_last_name: string;

	@IsString()
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty()
	usr_email: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class BankStatementDTO {
	@IsNumber()
	@IsNotEmpty()
	@ApiProperty()
	prc_id: number;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	prd_id: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	car_folio: string;

	@IsNumber()
	@IsOptional()
	@ApiProperty()
	car_rut: number;

	@IsString()
	@IsOptional()
	@ApiProperty()
	car_url: string;

	@IsString()
	@IsOptional()
	@ApiProperty()
	car_name: string;
}

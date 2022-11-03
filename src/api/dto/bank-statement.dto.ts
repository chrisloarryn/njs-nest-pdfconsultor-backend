import { IntersectionType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

export class BankStatementAdditionalInfoDTO {
	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	base64: boolean;
}

export class AcquireWithBase64DTO extends IntersectionType(BankStatementDTO, BankStatementAdditionalInfoDTO) {}

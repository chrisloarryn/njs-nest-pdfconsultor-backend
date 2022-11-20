import { IntersectionType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { BankStatementDTO } from '.';

export class BankStatementAdditionalInfoDTO {
	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	base64: boolean;
}

export class AcquireWithBase64DTO extends IntersectionType(BankStatementDTO, BankStatementAdditionalInfoDTO) {}

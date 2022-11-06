import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

import { BankStatement } from './bank-statement.entity';

export class BankStatementAdditionalInfo {
	@ApiProperty()
	base64: string;
}

// kind export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
export class AcquireBankStatementUrl extends PickType(BankStatement, ['prc_id', 'prd_id', 'car_folio', 'car_url'] as const) {}

export class AcquireWithBase64 extends IntersectionType(AcquireBankStatementUrl, BankStatementAdditionalInfo) {}

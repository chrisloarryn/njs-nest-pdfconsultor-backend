import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

import { BankStatement } from './bank-statement.entity';

export class BankStatementAdditionalInfo {
	@ApiProperty()
	base64?: string;
}

export class AcquireBankStatementUrl extends PickType(BankStatement, ['car_folio', 'car_url', 'car_periodo', 'car_rut', 'created_at'] as const) {}

export class AcquireWithBase64 extends IntersectionType(AcquireBankStatementUrl, BankStatementAdditionalInfo) {}

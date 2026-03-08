import { ApiProperty } from '@nestjs/swagger';

import type { BankStatementBase64Summary, BankStatementSummary } from '@/modules/bank-statements/domain/models/bank-statement.model';

export class BankStatementResponseDto {
	@ApiProperty()
	car_folio!: string;

	@ApiProperty({ nullable: true })
	car_periodo!: string | null;

	@ApiProperty({ nullable: true })
	car_rut!: number | null;

	@ApiProperty()
	car_url!: string;

	@ApiProperty({ type: String, nullable: true })
	created_at!: Date | null;
}

export class BankStatementWithBase64ResponseDto extends BankStatementResponseDto {
	@ApiProperty()
	base64!: string;
}

export function toBankStatementResponseDto(summary: BankStatementSummary): BankStatementResponseDto {
	return {
		car_folio: summary.folio,
		car_periodo: summary.period,
		car_rut: summary.rut,
		car_url: summary.url,
		created_at: summary.createdAt,
	};
}

export function toBankStatementWithBase64ResponseDto(summary: BankStatementBase64Summary): BankStatementWithBase64ResponseDto {
	return {
		...toBankStatementResponseDto(summary),
		base64: summary.base64,
	};
}

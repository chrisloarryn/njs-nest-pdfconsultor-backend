import { ApiProperty } from '@nestjs/swagger';

import type { BankStatementBase64Summary, BankStatementSummary } from '@/modules/bank-statements/domain/models/bank-statement.model';

export class BankStatementResponseDto {
	@ApiProperty({ example: 'FOLIO-001', type: String })
	car_folio!: string;

	@ApiProperty({ nullable: true, example: '202401', type: String })
	car_periodo!: string | null;

	@ApiProperty({ nullable: true, example: 18979569, type: Number })
	car_rut!: number | null;

	@ApiProperty({ example: 'https://example.com/cartola-1.pdf', type: String })
	car_url!: string;

	@ApiProperty({ type: String, nullable: true, example: '2026-03-08T00:00:00.000Z' })
	created_at!: Date | null;
}

export class BankStatementWithBase64ResponseDto extends BankStatementResponseDto {
	@ApiProperty({ example: 'ZmFrZS1wZGY=', type: String })
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

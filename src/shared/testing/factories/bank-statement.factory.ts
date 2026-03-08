import { faker } from '@faker-js/faker';

import type { BankStatementBase64Summary, BankStatementSummary } from '@/modules/bank-statements/domain/models/bank-statement.model';
import type { BankStatementOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/bank-statement.orm-entity';

export function createBankStatementSummary(overrides: Partial<BankStatementSummary> = {}): BankStatementSummary {
	return {
		createdAt: overrides.createdAt ?? faker.date.past(),
		folio: overrides.folio ?? faker.string.alphanumeric(10),
		period: overrides.period ?? faker.string.numeric(6),
		rut: overrides.rut ?? Number(faker.string.numeric(8)),
		url: overrides.url ?? faker.internet.url(),
	};
}

export function createBankStatementWithBase64Summary(overrides: Partial<BankStatementBase64Summary> = {}): BankStatementBase64Summary {
	const summary = createBankStatementSummary(overrides);
	return {
		...summary,
		base64: overrides.base64 ?? Buffer.from(summary.url).toString('base64'),
	};
}

export function createBankStatementOrmEntity(overrides: Partial<BankStatementOrmEntity> = {}): BankStatementOrmEntity {
	return {
		car_folio: overrides.car_folio ?? faker.string.alphanumeric(10),
		car_name: overrides.car_name ?? faker.word.words(2),
		car_periodo: overrides.car_periodo ?? faker.string.numeric(6),
		car_rut: overrides.car_rut ?? Number(faker.string.numeric(8)),
		car_url: overrides.car_url ?? faker.internet.url(),
		created_at: overrides.created_at ?? faker.date.past(),
		prc_id: overrides.prc_id ?? Number(faker.string.numeric(4)),
		prd_id: overrides.prd_id ?? faker.string.alphanumeric(6),
		updated_at: overrides.updated_at ?? faker.date.recent(),
		version: overrides.version ?? 1,
	} as BankStatementOrmEntity;
}

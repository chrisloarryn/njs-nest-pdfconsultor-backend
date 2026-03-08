import type { DataSource } from 'typeorm';

import { BankStatementOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/bank-statement.orm-entity';

export const bankStatementSeedFixtures: Array<Partial<BankStatementOrmEntity>> = [
	{
		car_folio: 'FOLIO-001',
		car_name: 'Cartola Enero',
		car_periodo: '202401',
		car_rut: 18979569,
		car_url: 'https://example.com/cartola-1.pdf',
		prc_id: 1,
		prd_id: 'PROD-1',
	},
	{
		car_folio: 'FOLIO-002',
		car_name: 'Cartola Febrero',
		car_periodo: '202402',
		car_rut: 18979569,
		car_url: 'https://example.com/cartola-2.pdf',
		prc_id: 2,
		prd_id: 'PROD-2',
	},
];

export async function seedBankStatements(dataSource: DataSource): Promise<number> {
	const repository = dataSource.getRepository(BankStatementOrmEntity);

	await repository.clear();
	await repository.save(bankStatementSeedFixtures.map((fixture) => repository.create(fixture)));

	return bankStatementSeedFixtures.length;
}

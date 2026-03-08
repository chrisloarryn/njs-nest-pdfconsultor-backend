import { seedBankStatements } from '@/ci/bank-statements.seed';
import { createCiApplication } from '@/ci/create-ci-application';
import { BankStatementOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/bank-statement.orm-entity';

async function main() {
	const { app, dataSource } = await createCiApplication({ seed: false });

	try {
		const insertedRows = await seedBankStatements(dataSource);
		const repository = dataSource.getRepository(BankStatementOrmEntity);
		const persistedRows = await repository.count();

		if (persistedRows !== insertedRows) {
			throw new Error(`Expected ${insertedRows} seeded rows but found ${persistedRows}.`);
		}

		console.log(`Seed verified with ${persistedRows} bank statements.`);
	} finally {
		await app.close();
	}
}

main().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});

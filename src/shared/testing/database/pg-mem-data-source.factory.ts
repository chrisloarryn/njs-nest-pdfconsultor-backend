import { DataType, newDb } from 'pg-mem';
import type { DataSource, DataSourceOptions } from 'typeorm';

export async function createPgMemDataSource(options: DataSourceOptions): Promise<DataSource> {
	const db = newDb({
		autoCreateForeignKeyIndices: true,
	});

	db.public.registerFunction({
		implementation: () => options.database ?? 'pdfconsultor',
		name: 'current_database',
		returns: DataType.text,
	});
	db.public.registerFunction({
		implementation: () => 'public',
		name: 'current_schema',
		returns: DataType.text,
	});
	db.public.registerFunction({
		implementation: () => 'PostgreSQL 16.0 (pg-mem)',
		name: 'version',
		returns: DataType.text,
	});

	const dataSource = db.adapters.createTypeormDataSource(options) as DataSource;
	await dataSource.initialize();
	return dataSource;
}

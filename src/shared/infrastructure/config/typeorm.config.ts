import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { BankStatementOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/bank-statement.orm-entity';
import { ProcessOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/process.orm-entity';
import { ProductOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/product.orm-entity';
import { createPgMemDataSource } from '@/shared/testing/database/pg-mem-data-source.factory';

import type { DatabaseConfig } from './database.config';

const entities = [BankStatementOrmEntity, ProcessOrmEntity, ProductOrmEntity];

export function createTypeOrmModuleOptions(config: DatabaseConfig): TypeOrmModuleOptions {
	return {
		autoLoadEntities: false,
		database: config.database,
		entities,
		extra: {
			driver: config.driver,
		},
		host: config.host,
		logging: config.logging,
		password: config.password,
		port: config.port,
		retryAttempts: config.driver === 'pg-mem' ? 0 : 3,
		retryDelay: 250,
		synchronize: config.synchronize,
		type: 'postgres',
		username: config.username,
	};
}

export async function createTypeOrmDataSource(options: TypeOrmModuleOptions): Promise<DataSource> {
	const driver = isDriverMetadata(options.extra) && options.extra.driver ? options.extra.driver : 'postgres';
	if (driver === 'pg-mem') {
		return createPgMemDataSource(options as DataSourceOptions);
	}

	const dataSource = new DataSource(options as DataSourceOptions);
	return dataSource.initialize();
}

function isDriverMetadata(value: unknown): value is { driver?: string } {
	return typeof value === 'object' && value !== null && 'driver' in value;
}

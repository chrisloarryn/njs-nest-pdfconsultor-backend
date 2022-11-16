import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import pgConfig from './pg.config';
import { PostgresConfig } from './postgres.config';

describe('postgres.config for TypeOrm Module', () => {
	let config: TypeOrmModuleOptions;
	let postgresConfig: PostgresConfig;

	beforeEach(async () => {
		process.env.POSTGRES_HOST = 'localhost';
		process.env.POSTGRES_PORT = '5432';
		process.env.POSTGRES_USER = 'postgres';
		process.env.POSTGRES_PASS = 'postgres';
		process.env.POSTGRES_DB = 'postgres';
		process.env.POSTGRES_SYNCHRONIZE = 'true';
		process.env.POSTGRES_LOGGING = 'true';

		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forFeature(pgConfig)],
		}).compile();

		// config = module.get<ConfigType<typeof pgConfig>>(pgConfig.KEY);
		config = module.get<TypeOrmModuleOptions>(pgConfig.KEY) as TypeOrmModuleOptions;

		postgresConfig = new PostgresConfig(config as TypeOrmModuleOptions);
	});

	describe('when all environment variables are defined', () => {
		it.concurrent('[OK] config should be defined', () => {
			expect(config).toBeDefined();
		});
		it.concurrent('[OK] postgresConfig should be defined', () => {
			expect(postgresConfig).toBeDefined();
		});
	});

	describe('when create ok typeorm config', () => {
		it.concurrent('[OK] config object should have mandatory postgres variales', () => {
			expect(config).toHaveProperty('type');
			expect(config).toHaveProperty('host');
			expect(config).toHaveProperty('port');
			expect(config).toHaveProperty('username');
		});

		it.concurrent('[OK] should create a valid typeorm config for postgres with all environment variables defined', () => {
			// deep clone by prevent read-only error modifying config object.
			const configMutable: any = { ...config };

			const validOpts = postgresConfig.validate();

			// mutate config object to match validOpts.
			configMutable.synchronize = true;
			configMutable.logging = true;

			const { type, database, synchronize, logging } = configMutable;

			expect(type).toEqual(validOpts.type);
			expect(database).toEqual(validOpts.database);
			expect(synchronize).toEqual(validOpts.synchronize);
			expect(logging).toEqual(validOpts.logging);
		});
	});
});

import { ConfigModule, ConfigType } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';

import pgConfig from './pg.config';

describe('pgConfig', () => {
	let config: ConfigType<typeof pgConfig>;

	beforeEach(async () => {
		process.env.POSTGRES_HOST = 'localhost';
		process.env.POSTGRES_PORT = '5432';
		process.env.POSTGRES_USER = 'postgres';
		process.env.POSTGRES_PASS = 'postgres';
		process.env.POSTGRES_DB = 'postgres';

		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forFeature(pgConfig)],
		}).compile();

		config = module.get<ConfigType<typeof pgConfig>>(pgConfig.KEY);
	});

	describe('When configuration is ok', () => {
		it.concurrent('[OK] should be defined', () => {
			expect(pgConfig).toBeDefined();
		});
	});

	describe('When all environment variables are defined', () => {
		it.concurrent('[OK] should contains defined variables and be same as process.env', async () => {
			expect(config).toBeDefined();
			expect(config.type).toBeDefined();
			expect(config.host).toBeDefined();
			expect(config.port).toBeDefined();
			expect(config.username).toBeDefined();
			expect(config.password).toBeDefined();
			expect(config.database).toBeDefined();
			expect(config.synchronize).toBeDefined();
			expect(config.logging).toBeDefined();
			expect(config.entities).toBeDefined();
			expect(config.migrations).toBeDefined();
			expect(config.subscribers).toBeDefined();
		});

		it.concurrent('[OK] should have mandatory postgresql configuration environment variables', async () => {
			expect(config.type).toEqual('postgres');
			expect(config.host).toEqual('localhost');
			expect(config.port).toEqual(5432);
			expect(config.username).toEqual('postgres');
			expect(config.password).toEqual('postgres');
			expect(config.database).toEqual('postgres');
		});
	});
});

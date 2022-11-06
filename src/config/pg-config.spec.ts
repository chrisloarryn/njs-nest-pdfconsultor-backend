import { ConfigModule, ConfigType } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';

import pgConfig from './pg-config';

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

	it('should be defined', () => {
		expect(pgConfig).toBeDefined();
	});

	it('should contains token and version for vault', async () => {
		expect(config).toBeDefined();
		expect(config.type).toBeDefined();
		expect(config.host).toBeDefined();
		expect(config.port).toBeDefined();
		expect(config.username).toBeDefined();
		expect(config.password).toBeDefined();
		expect(config.database).toBeDefined();
		expect(config.synchronize).toBeDefined();
		expect(config.keepConnectionAlive).toBeDefined();
	});
});

import { InternalServerErrorException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { isEmpty } from 'lodash';

import { ErrorConfigIsNotDefined, ErrorValidationTypeError } from './../api/common/constants/errorConstants';
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

	describe('when error in configuration ocurred', () => {
		let config: any;

		it('should throw error en empty data found for config', () => {
			let cfg: any;
			try {
				cfg = new PostgresConfig(config);
			} catch (error: any) {
				expect(error).toBeDefined();
				expect(error).toBeInstanceOf(InternalServerErrorException);
				expect(error.message).toEqual(ErrorConfigIsNotDefined);
			}
			expect(cfg).toEqual(config);
		});
		it('should throw error en empty data found for config validate fn', () => {
			const cfg: TypeOrmModuleOptions = {};
			config = {
				autoLoadEntities: true,
			};

			try {
				const options = new PostgresConfig(config);
				options.postgresConfig = undefined;
				options.validate();
			} catch (error: any) {
				expect(error).toBeDefined();
				expect(error).toBeInstanceOf(InternalServerErrorException);
				expect(error.message).toEqual(ErrorConfigIsNotDefined);
			}
			expect(isEmpty(cfg)).toBeTruthy();
			expect(isEmpty(config)).toBeFalsy();
		});

		it('should throw error on type validation', () => {
			const cfg: TypeOrmModuleOptions = {};
			config = {
				autoLoadEntities: true,
				host: 1234,
			};

			try {
				const options = new PostgresConfig(config);
				options.validate();
			} catch (error: any) {
				expect(error).toBeDefined();
				expect(error).toBeInstanceOf(InternalServerErrorException);
				expect(error.message).toEqual(ErrorValidationTypeError);
			}
			expect(isEmpty(cfg)).toBeTruthy();
			expect(isEmpty(config)).toBeFalsy();
		});
	});

	describe('when config seems to be OK create typeorm config works!', () => {
		it('should throw error on type validation', async () => {
			let cfg: TypeOrmModuleOptions = {};

			let typeOrmOptions: TypeOrmModuleOptions = {};

			cfg = {
				autoLoadEntities: true,
				host: 'localhost',
				type: 'postgres',
				port: 5432,
				username: 'localhost',
				password: 'localhost',
				database: 'localhost',
			};

			try {
				const options = new PostgresConfig(cfg);
				const isOK = !isEmpty(options.validate());

				if (isOK) {
					typeOrmOptions = await options.createTypeOrmOptions();
				}

				expect(typeOrmOptions).toBeDefined();
				expect(isEmpty(typeOrmOptions)).toBeFalsy();
			} catch (error: any) {
				expect(error).toBeUndefined();
			}
			expect(isEmpty(cfg)).toBeFalsy();
			expect(isEmpty(typeOrmOptions)).toBeFalsy();
		});
	});
});

import { InMemoryDBModule } from '@nestjs-addons/in-memory-db';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { WinstonModule } from 'nest-winston';

import {
	BankStatementController,

	// tbd
	PostController,
	TestController,
	UserController,
	UserMemoryController,
} from './api/controller';
import { BankStatement, User } from './api/entities';
import {
	BankStatementRepository,

	// tbd
	UserRepository,
} from './api/repository';
import {
	BankStatementService,

	// tbd
	PostService,
	UserMemoryService,
	UserService,
} from './api/service';
import { dotEnvOptions, HealthController } from './api/utils';
import { HttpConfig, LoggerConfig, PostgresConfig } from './config';
import pgConfig from './config/pg.config';

dotenv.config({ path: dotEnvOptions.path });

const logger: LoggerConfig = new LoggerConfig();
const http: HttpConfig = new HttpConfig();

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [dotEnvOptions.path, '.env'],
			load: [pgConfig],
			isGlobal: true,
		}),
		WinstonModule.forRoot(logger.console()),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => {
				const pgConfig = config.get<TypeOrmModuleOptions>('pg') as TypeOrmModuleOptions;

				const postgresConfig: PostgresConfig = new PostgresConfig(pgConfig);
				const isValid = postgresConfig.validate();
				if (!isValid) {
					throw new Error('Invalid typeorm config');
				}

				const typeOrmOptions = postgresConfig.createTypeOrmOptions();

				return typeOrmOptions;
			},
		}),
		TypeOrmModule.forFeature([BankStatement, User]),
		InMemoryDBModule.forRoot({}),
		HttpModule.register(http.getOptions()),
		TerminusModule,
	],
	controllers: [
		HealthController,
		BankStatementController,

		// tbd
		PostController,
		TestController,
		UserController,
		UserMemoryController,
	],
	providers: [
		BankStatementService,

		// tbd
		PostService,
		UserMemoryService,
		UserService,
		BankStatementRepository,
		// tbd
		UserRepository,
	],
})
export class AppModule {}

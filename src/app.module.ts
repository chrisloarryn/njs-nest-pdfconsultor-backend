import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { BankStatementsModule } from '@/modules/bank-statements/bank-statements.module';
import { HealthModule } from '@/modules/health/health.module';
import appConfig from '@/shared/infrastructure/config/app.config';
import databaseConfig, { type DatabaseConfig } from '@/shared/infrastructure/config/database.config';
import { validateEnv } from '@/shared/infrastructure/config/env.validation';
import { resolveEnvFilePath } from '@/shared/infrastructure/config/env-file-path';
import { createTypeOrmDataSource, createTypeOrmModuleOptions } from '@/shared/infrastructure/config/typeorm.config';
import { createWinstonOptions } from '@/shared/infrastructure/logging/logger.config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [resolveEnvFilePath()],
			load: [appConfig, databaseConfig],
			validate: validateEnv,
		}),
		WinstonModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => createWinstonOptions(configService.get<string>('app.serviceName')),
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
				const config = configService.getOrThrow<DatabaseConfig>('database');
				return createTypeOrmModuleOptions(config);
			},
			dataSourceFactory: async (options) => createTypeOrmDataSource(options as TypeOrmModuleOptions),
		}),
		TerminusModule,
		BankStatementsModule,
		HealthModule,
	],
})
export class AppModule {}

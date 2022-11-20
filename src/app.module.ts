import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { WinstonModule } from 'nest-winston';

import { dotEnvOptions } from '@ccla/api/common/utils/dotenv-options';
import { HealthController } from '@ccla/api/common/utils/health.controller';
import { BankStatementModule } from '@ccla/api/modules/bank-statement/bank-statement.module';
import { BankStatement } from '@ccla/api/modules/bank-statement/entities/bank-statement.entity';
import { Process } from '@ccla/api/modules/process/entities/process.entity';
import { Product } from '@ccla/api/modules/product/entities/product.entity';
import { HttpConfig } from '@ccla/config/http.config';
import { LoggerConfig } from '@ccla/config/loggerConfig';
import pgConfig from '@ccla/config/pg.config';
import { PostgresConfig } from '@ccla/config/postgres.config';

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
		TypeOrmModule.forFeature([BankStatement, Process, Product]),
		HttpModule.register(http.getOptions()),
		TerminusModule,
		BankStatementModule,
	],
	controllers: [HealthController],
})
export class AppModule {}

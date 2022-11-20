import { InMemoryDBModule } from '@nestjs-addons/in-memory-db';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmDataSourceFactory } from '@nestjs/typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { WinstonModule } from 'nest-winston';
import { DataType, newDb, IMemoryDb } from 'pg-mem';
import request from 'supertest';

import { LoggerConfig } from '../src/config';
import pgConfig from '../src/config/pg.config';
import { createBankStatement } from './../src/api/common/helpers';
import { dotEnvOptions } from './../src/api/common/utils';
import { BankStatementModule } from './../src/api/modules/bank-statement/bank-statement.module';
import { BankStatementController } from './../src/api/modules/bank-statement/controller/bank-statement.controller';
import { BankStatement } from './../src/api/modules/bank-statement/entities';
import { BankStatementRepository } from './../src/api/modules/bank-statement/repository/bank-statement.repository';
import { BankStatementService } from './../src/api/modules/bank-statement/service';
import { Process } from './../src/api/modules/process/entities/process.entity';
import { ProcessModule } from './../src/api/modules/process/process.module';
import { Product } from './../src/api/modules/product/entities/product.entity';
import { ProductModule } from './../src/api/modules/product/product.module';
import { AppModule } from './../src/app.module';

const logger: LoggerConfig = new LoggerConfig();

describe('Test (e2e)', () => {
	let app: INestApplication;
	const controller = BankStatementController;

	const mockedRepo = {
		getBankStatementsByPeriodRutAndFolio: jest.fn(),
		getPdfsByPeriodAndRut: jest.fn(),
		getPdfsByFolioAndRut: jest.fn(),
		getPdfsByPeriodAndFolio: jest.fn(),
		getPdfsByFolio: jest.fn(),
		getPdfsByRut: jest.fn(),
	};
	function loadConfig(): Promise<void> {
		return new Promise((resolve, reject) => {
			import('dotenv')
				.then((handler) => {
					console.log('====================================');
					console.log({ path: dotEnvOptions.path });
					console.log('====================================');
					handler.config({ path: dotEnvOptions.path });
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		});
	}

	beforeAll(async () => {
		jest.setTimeout(30000);
	});

	beforeEach(async () => {
		await loadConfig();
		// Register current_database function

		console.log('====================================');
		console.log(process.env.NODE_ENV, process.env.PORT);
		console.log('====================================');
		const winstonLogger = WinstonModule.createLogger(logger.console());
		winstonLogger.log('info', 'test');
		winstonLogger.log('env', process.env.NODE_ENV);
		winstonLogger.log('port', process.env.PORT);
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, BankStatementModule],
			controllers: [BankStatementController],
			providers: [BankStatementService],
		}).compile();

		app = moduleFixture.createNestApplication();

		app.useLogger(winstonLogger);
		await app.init();
	});

	// it('/bank-statements/processID/car_folio?b64=true (GET)', () => {
	// 	return request(app.getHttpServer())
	// 		.get('/bank-statements/1/AEDS1?b64=true')
	// 		.expect(HttpStatus.OK)
	// 		.expect('Content-Type', /json/)
	// 		.expect(mockBankStatement);
	// });

	afterEach(async () => {
		console.log('====================================');
		console.log('afterEach');
		console.log('====================================');
	});

	describe('should be defined', () => {
		it('should be defined', () => {
			expect(controller).toBeDefined();
		});
	});

	// describe('BankStatement (e2e)', () => {
	// 	const epUrl = `http://localhost:3000/cartolab/bank-statements`;

	// 	it('should trigger a rut search - /pdf?b64=true', async () => {
	// 		return request(epUrl)
	// 			.get('/pdf?b64=true')
	// 			.set('Content-Type', 'application/json')
	// 			.set('Accept', 'application/json')
	// 			.set('X-Folio', 'AEDS1')
	// 			.set('X-Rut', '123456789')
	// 			.set('X-Period', '202001')
	// 			.send()
	// 			.expect((response: request.Response) => {
	// 				expect(response.body).toBeDefined();
	// 			});
	// 	});
	// });

	// describe('When find by one rut', () => {
	// 	it('/cartolab/bank-statements/pdf?b64=true (GET)', () => {
	// 		return request(app.getHttpServer())
	// 			.get('/cartolab/bank-statements?b64=true')
	// 			.expect(HttpStatus.OK)
	// 			.expect('Content-Type', /json/)
	// 			.expect(
	// 				createBankStatement({
	// 					rut: 189795696,
	// 				}),
	// 			);
	// 	});
	// });
});

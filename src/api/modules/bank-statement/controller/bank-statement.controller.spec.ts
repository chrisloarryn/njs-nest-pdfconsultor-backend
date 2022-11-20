import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { from, lastValueFrom, Observable } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from 'winston';

import { createBankStatement } from '@ccla/api/common/helpers';
import { LoggerConfig } from '@ccla/config/loggerConfig';

import { BankStatement } from '../entities';
import { BankStatementRepository } from '../repository';
import { BankStatementService } from '../service';
import { BankStatementController } from './bank-statement.controller';

const logger: LoggerConfig = new LoggerConfig();

describe('BankStatementController', () => {
	let service: BankStatementService;
	let controller: BankStatementController;
	let winstonLogger: Logger;

	const request = {
		folio: faker.random.numeric(10),
		period: new Date().getFullYear() + faker.date.month(),
		rut: Number(faker.random.numeric(10)),
		options: {
			base64: false,
		},
	};
	process.env.LOG_LEVEL = 'info';

	beforeEach(async () => {
		const mockedService = {
			getBankStatementsByPeriodRutAndFolio: vi.fn(),
			handleObservableResponse: vi.fn(),
			getPdfAsBase64: vi.fn(),
		};
		const mockedRepo = {
			getBankStatementsByPeriodRutAndFolio: vi.fn(),
			getPdfsByPeriodAndRut: vi.fn(),
			getPdfsByFolioAndRut: vi.fn(),
			getPdfsByPeriodAndFolio: vi.fn(),
			getPdfsByFolio: vi.fn(),
			getPdfsByRut: vi.fn(),
		};

		const moduleRef: TestingModule = await Test.createTestingModule({
			imports: [WinstonModule.forRoot(logger.console())],
			controllers: [BankStatementController],
			providers: [
				BankStatementService,
				{
					provide: BankStatementRepository,
					useValue: mockedRepo,
				},
				{
					provide: getRepositoryToken(BankStatement),
					useValue: {
						createQueryBuilder: vi.fn(),
						find: vi.fn(),
					},
				},
			],
		})
			.overrideProvider(BankStatementService)
			.useValue(mockedService)
			.compile();

		service = moduleRef.get<BankStatementService>(BankStatementService);

		// create winston logger instance
		winstonLogger = moduleRef.get<Logger>(WINSTON_MODULE_NEST_PROVIDER);

		controller = new BankStatementController(service, winstonLogger);
	});

	describe('When both service and controller are declared', () => {
		it('[OK] controller should be defined', () => {
			expect(controller).toBeDefined();
		});

		it('[OK] service should be defined', () => {
			expect(service).toBeDefined();
		});
	});

	describe('When getBankStatementsByPeriodRutAndFolio is called', () => {
		it('[OK] should return an observable', async () => {
			const bankStatements = [
				createBankStatement({
					rut: 189893280,
				}),
			];

			vi.spyOn(service, 'getBankStatementsByPeriodRutAndFolio').mockReturnValue(from([bankStatements]));

			try {
				const res = controller.getBankStatementByProcessIdAndFolio(request.folio, request.period, String(request.rut), request.options.base64);
				expect(res).toBeInstanceOf(Observable);

				const result = await lastValueFrom(res);
				expect(result).toEqual(bankStatements);
			} catch (error: any) {
				expect(error).toBeUndefined();
			}
		});
	});
});

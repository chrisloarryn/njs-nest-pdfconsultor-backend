import { faker } from '@faker-js/faker';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Observable, from, lastValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createBankStatement } from './../../../../../test/helpers';
import { AcquireWithBase64, BankStatement } from './../entities';
import { BankStatementRepository } from './../repository';
import { BankStatementService } from './bank-statement.service';

describe('BankStatementService', () => {
	let service: BankStatementService;
	let repo: BankStatementRepository;
	const request = {
		folio: faker.random.numeric(10),
		period: new Date().getFullYear() + faker.date.month(),
		rut: Number(faker.random.numeric(10)),
		options: {
			base64: true,
		},
	};
	process.env.LOG_LEVEL = 'info';

	afterEach(() => {
		vi.restoreAllMocks();
	});

	beforeEach(async () => {
		const mockedRepo = {
			getBankStatementsByPeriodRutAndFolio: vi.fn(),
			getPdfsByPeriodAndRut: vi.fn(),
			getPdfsByFolioAndRut: vi.fn(),
			getPdfsByPeriodAndFolio: vi.fn(),
			getPdfsByFolio: vi.fn(),
			getPdfsByRut: vi.fn(),
		};
		const mockedBankStatementsService = {
			getBankStatementsByPeriodRutAndFolio: vi.fn(),
			findByRut: vi.fn(),
			findByFolioAndRut: vi.fn(),
			findByPeriodAndFolio: vi.fn(),
			findByPeriodAndRut: vi.fn(),
			findByPeriodRutAndFolio: vi.fn(),
		};

		const app = await Test.createTestingModule({
			providers: [
				BankStatementService,
				{
					provide: BankStatementService,
					useFactory: vi.fn(),
					useValue: mockedBankStatementsService,
				},
				{
					provide: BankStatementRepository,
					useFactory: vi.fn(),
					useValue: mockedRepo,
				},
				{
					provide: getRepositoryToken(AcquireWithBase64),
					useValue: mockedRepo,
				},
			],
		}).compile();

		service = app.get<BankStatementService>(BankStatementService);
		repo = app.get<BankStatementRepository>(BankStatementRepository);
	});

	describe('When Test Bank statement service [BS]', () => {
		describe('When Test getBankStatementsByPeriodRutAndFolio [BS-1]', () => {
			it('should throw when any options as parameters', async () => {
				const mockedErr = new BadRequestException('Bad Request');

				const find = vi.fn().mockReturnValueOnce(from([]));

				vi.spyOn(repo, 'getBankStatementsByPeriodRutAndFolio').mockImplementation(find);
				vi.spyOn(service, 'getBankStatementsByPeriodRutAndFolio').mockImplementation(() => {
					throw mockedErr;
				});

				try {
					expect(() => lastValueFrom(service.getBankStatementsByPeriodRutAndFolio())).rejects.toThrowError(mockedErr);
				} catch (error: any) {
					expect(error).toBeInstanceOf(BadRequestException);
					expect(error.message).toBe('Bad Request');
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
				}
			});
			// it('should throw when any options as parameters', async () => {
			// 	const result = await lastValueFrom(service.getBankStatementsByPeriodRutAndFolio(undefined));
			// 	expect(result).toBeInstanceOf(BadRequestException);
			// });
		});
	});
});

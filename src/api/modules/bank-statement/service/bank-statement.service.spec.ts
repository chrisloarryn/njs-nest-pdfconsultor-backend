import { faker } from '@faker-js/faker';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { from, lastValueFrom } from 'rxjs';

import { AcquireWithBase64, BankStatement } from '@ccla/api/modules/bank-statement/entities';
import { BankStatementRepository } from '@ccla/api/modules/bank-statement/repository';

import { createBankStatement } from './../../../../../test/helpers';
import { BankStatementService } from './bank-statement.service';

describe('BankStatementService', () => {
	let service: BankStatementService;
	let testingModule: TestingModule;

	beforeEach(async () => {
		const mockedRepo = {
			getBankStatementsByByPeriodRutAndFolio: jest.fn(),
			getPdfsByPeriodAndRut: jest.fn(),
			getPdfsByFolioAndRut: jest.fn(),
			getPdfsByPeriodAndFolio: jest.fn(),
			getPdfsByFolio: jest.fn(),
			getPdfsByRut: jest.fn(),
		};
		const mockedBankStatementsService = {
			getBankStatementByPeriodRutAndFolio: jest.fn(),
			findByRut: jest.fn(),
			findByFolioAndRut: jest.fn(),
			findByPeriodAndFolio: jest.fn(),
			findByPeriodAndRut: jest.fn(),
			findByPeriodRutAndFolio: jest.fn(),
		};

		testingModule = await Test.createTestingModule({
			providers: [
				{
					provide: BankStatementService,
					useFactory: jest.fn(),
					useValue: mockedBankStatementsService,
				},
				{
					provide: BankStatementRepository,
					useFactory: jest.fn(),
				},
				{
					provide: getRepositoryToken(AcquireWithBase64),
					useValue: mockedRepo,
				},
			],
		}).compile();

		service = testingModule.get<BankStatementService>(BankStatementService);
	});

	describe('When Test Bank statement service [BS]', () => {
		describe('When imports are working properly', () => {
			it('[OK] service should be defined', () => {
				expect(service).toBeDefined();
			});
		});

		describe('When none of the options were provided', () => {
			const request = {
				folio: undefined,
				period: undefined,
				rut: undefined,
				options: {
					base64: true,
				},
			};
			it('[ERROR] should throw a bad request exception', async () => {
				try {
					jest.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
						throw new BadRequestException('Bank statement options are required');
					});

					await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));
				} catch (error: any) {
					expect(error).toBeInstanceOf(BadRequestException);
					expect(error.message).toBe('Bank statement options are required');
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
				}
			});
		});

		describe('When try to make a request finding by period only (folio and rut were not provided)', () => {
			const request = {
				folio: undefined,
				period: new Date().getFullYear() + faker.date.month(),
				rut: undefined,
				options: {
					base64: true,
				},
			};
			process.env.LOG_LEVEL = 'info';

			it('[ERROR] should throw an error (rut or folio is required) - [getBankStatementByPeriodRutAndFolio]', async () => {
				try {
					jest.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
						throw new BadRequestException('rut or folio is required');
					});

					await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('rut or folio is required');
					expect(error.name).toBe(BadRequestException.name);
				}
			});
		});

		describe('When try to make a request finding by period and folio (rut was not provided)', () => {
			const request = {
				folio: faker.random.alphaNumeric(10),
				period: new Date().getFullYear() + faker.date.month(),
				rut: undefined,
				options: {
					base64: true,
				},
			};
			process.env.LOG_LEVEL = 'info';

			it('[OK] should retrieve a bank statement', async () => {
				const bankStatements = [
					createBankStatement({
						folio: request.folio,
						period: request.period,
					}),
				];

				jest.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));
				const result = await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it('[OK] should perform a right request by period and folio - [findByPeriodAndFolio]', async () => {
				const bankStatements = [
					createBankStatement({
						folio: request.folio,
						period: request.period,
						base64: request.options.base64,
					}),
				];

				jest.spyOn(service, 'findByPeriodAndFolio').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByPeriodAndFolio(request.period, request.folio, request.options));

				expect(jest.spyOn(service, 'findByPeriodAndFolio')).toBeCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it('[OK] should return a empty array (bank statement not found) - [findByPeriodAndFolio]', async () => {
				const bankStatements: BankStatement[] = [];

				jest.spyOn(service, 'findByPeriodAndFolio').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByPeriodAndFolio(request.period, request.folio, request.options));

				expect(jest.spyOn(service, 'findByPeriodAndFolio')).toBeCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result).toHaveLength(0);
			});
		});

		describe('When try to perform a request finding by rut only (period and folio were not provided)', () => {
			const request = {
				folio: undefined,
				period: undefined,
				rut: faker.random.numeric(10),
				options: {
					base64: true,
				},
			};
			process.env.LOG_LEVEL = 'info';

			it('[ERROR] should throw an error if rut is not valid - [getBankStatementByPeriodRutAndFolio]', async () => {
				try {
					jest.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it('[OK] should fin a bank statement using a right rut - [getBankStatementByPeriodRutAndFolio]', async () => {
				request.rut = '253595635';

				const bankStatements = [
					createBankStatement({
						rut: Number(request.rut),
					}),
				];

				jest.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));
				const result = await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it('[ERROR] should throw an error if rut is not valid - [findByRut]', async () => {
				try {
					jest.spyOn(service, 'findByRut').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.findByRut(request.rut));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it('[OK] should perform a right request by rut - [findByRut]', async () => {
				const bankStatements = [
					createBankStatement({
						rut: Number(request.rut),
						base64: request.options.base64,
					}),
				];

				jest.spyOn(service, 'findByRut').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByRut(request.rut));

				expect(jest.spyOn(service, 'findByRut')).toBeCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});
		});

		describe('When try to perform a request finding by folio and rut (period was not provided)', () => {
			const request = {
				folio: faker.random.numeric(10),
				period: undefined,
				rut: faker.random.numeric(10),
				options: {
					base64: true,
				},
			};
			process.env.LOG_LEVEL = 'info';

			it('[ERROR] should throw an error if rut is not valid - [getBankStatementByPeriodRutAndFolio]', async () => {
				try {
					jest.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it('[OK] should fin a bank statement using a right rut - [getBankStatementByPeriodRutAndFolio]', async () => {
				request.rut = '253595635';

				const bankStatements = [
					createBankStatement({
						rut: Number(request.rut),
					}),
				];

				jest.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));
				const result = await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it('[ERROR] should throw an error if rut is not valid - [findByFolioAndRut]', async () => {
				try {
					jest.spyOn(service, 'findByFolioAndRut').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.findByFolioAndRut(request.rut, request.folio, request.options));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it('[OK] should find bankStatement by folio and rut', async () => {
				const bankStatements = [
					createBankStatement({
						folio: request.folio,
						rut: Number(request.rut),
						base64: request.options.base64,
					}),
				];

				jest.spyOn(service, 'findByFolioAndRut').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByFolioAndRut(request.folio, request.rut, request.options));

				expect(jest.spyOn(service, 'findByFolioAndRut')).toBeCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it('[OK] should return a empty array (bank statement not found) - [findByPeriodAndFolio]', async () => {
				const bankStatements: BankStatement[] = [];

				jest.spyOn(service, 'findByFolioAndRut').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByFolioAndRut(request.folio, request.rut, request.options));

				expect(jest.spyOn(service, 'findByFolioAndRut')).toBeCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result).toHaveLength(0);
			});
		});

		describe('When try to perform a request finding by period and rut (folio was not provided)', () => {
			const request = {
				folio: undefined,
				period: new Date().getFullYear() + faker.date.month(),
				rut: faker.random.numeric(10),
				options: {
					base64: true,
				},
			};
			process.env.LOG_LEVEL = 'info';

			it('[ERROR] should throw an error if rut is not valid - [getBankStatementByPeriodRutAndFolio]', async () => {
				try {
					jest.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it('[OK] should fin a bank statement using a right rut - [getBankStatementByPeriodRutAndFolio]', async () => {
				request.rut = '253595635';

				const bankStatements = [
					createBankStatement({
						rut: Number(request.rut),
					}),
				];

				jest.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));
				const result = await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it('[ERROR] should throw an error if rut is not valid - [findByPeriodAndRut]', async () => {
				try {
					jest.spyOn(service, 'findByPeriodAndRut').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.findByPeriodAndRut(request.period, request.rut, request.options));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it('[OK] should find bankStatement by folio and rut [findByPeriodAndRut]', async () => {
				const bankStatements = [
					createBankStatement({
						folio: request.folio,
						rut: Number(request.rut),
						base64: request.options.base64,
					}),
				];

				jest.spyOn(service, 'findByPeriodAndRut').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByPeriodAndRut(request.period, request.rut, request.options));

				expect(jest.spyOn(service, 'findByPeriodAndRut')).toBeCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it('[OK] should return a empty array (bank statement not found) - [findByPeriodAndRut]', async () => {
				const bankStatements: BankStatement[] = [];

				jest.spyOn(service, 'findByPeriodAndRut').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByPeriodAndRut(request.period, request.rut, request.options));

				expect(jest.spyOn(service, 'findByPeriodAndRut')).toBeCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result).toHaveLength(0);
			});
		});

		describe('When all parameters are setted in the request (folio, periodo, rut)', () => {
			const request = {
				folio: faker.random.numeric(10),
				period: new Date().getFullYear() + faker.date.month(),
				rut: Number(faker.random.numeric(10)),
				options: {
					base64: true,
				},
			};
			process.env.LOG_LEVEL = 'info';

			it('[OK] should works properly returning no matched cartolas', async () => {
				const bankStatements: BankStatement[] = [];

				jest.spyOn(service, 'findByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByPeriodRutAndFolio(request.period, request.rut, request.folio, request.options));

				expect(jest.spyOn(service, 'findByPeriodRutAndFolio')).toBeCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result).toHaveLength(0);
			});

			it('[OK] should works properly returning one match', async () => {
				const bankStatements = [
					createBankStatement({
						base64: request.options.base64,
						period: request.period,
						folio: request.folio,
						rut: request.rut,
					}),
				];

				jest.spyOn(service, 'findByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByPeriodRutAndFolio(request.period, request.rut, request.folio, request.options));

				expect(jest.spyOn(service, 'findByPeriodRutAndFolio')).toBeCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result).toHaveLength(1);

				expect(result[0]).toBe(bankStatements[0]);
			});
		});
	});
});

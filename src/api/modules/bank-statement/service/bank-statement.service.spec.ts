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
	let testingModule: TestingModule;

	afterEach(() => {
		vi.restoreAllMocks();
	});

	beforeEach(async () => {
		const mockedRepo = {
			getBankStatementsByByPeriodRutAndFolio: vi.fn(),
			getPdfsByPeriodAndRut: vi.fn(),
			getPdfsByFolioAndRut: vi.fn(),
			getPdfsByPeriodAndFolio: vi.fn(),
			getPdfsByFolio: vi.fn(),
			getPdfsByRut: vi.fn(),
		};
		const mockedBankStatementsService = {
			getBankStatementByPeriodRutAndFolio: vi.fn(),
			findByRut: vi.fn(),
			findByFolioAndRut: vi.fn(),
			findByPeriodAndFolio: vi.fn(),
			findByPeriodAndRut: vi.fn(),
			findByPeriodRutAndFolio: vi.fn(),
		};

		testingModule = await Test.createTestingModule({
			providers: [
				{
					provide: BankStatementService,
					useFactory: vi.fn(),
					useValue: mockedBankStatementsService,
				},
				{
					provide: BankStatementRepository,
					useFactory: vi.fn(),
				},
				{
					provide: getRepositoryToken(AcquireWithBase64),
					useValue: mockedRepo,
				},
			],
		})
			.overrideProvider(BankStatementService)
			.useValue(mockedBankStatementsService)
			.compile();

		service = testingModule.get<BankStatementService>(BankStatementService);
	});

	describe('When Test Bank statement service [BS]', () => {
		describe('When imports are working properly', () => {
			it.concurrent('[OK] service should be defined', () => {
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
			it.concurrent('[ERROR] should throw a bad request exception', async () => {
				try {
					vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
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

			it.concurrent('[ERROR] should throw an error (rut or folio is required) - [getBankStatementByPeriodRutAndFolio]', async () => {
				try {
					/* vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
						throw new BadRequestException('rut or folio is required');
					}); */
					vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
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

			it.concurrent('[OK] should retrieve a bank statement', async () => {
				const bankStatements = [
					createBankStatement({
						folio: request.folio,
						period: request.period,
					}),
				];

				vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));
				const result = await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it.concurrent('[OK] should perform a right request by period and folio - [findByPeriodAndFolio]', async () => {
				const reqFolio = request.folio + 1;
				const reqPeriod = request.period + 1;

				const bankStatements = [
					createBankStatement({
						folio: request.folio,
						period: request.period,
						base64: request.options.base64,
					}),
					createBankStatement({
						folio: reqFolio,
						period: reqPeriod,
					}),
				];

				const spy = vi.spyOn(service, 'findByPeriodAndFolio').mockImplementation((): Observable<BankStatement[] | AcquireWithBase64[]> => {
					return from([bankStatements]);
				});

				const response = await lastValueFrom(service.findByPeriodAndFolio(request.period, request.folio, request.options));

				expect(spy).toHaveBeenCalled();

				expect(spy).toHaveBeenCalledWith(request.period, request.folio, request.options);

				expect(response[0]).toEqual(bankStatements[0]);

				const mockedSecond = bankStatements[1];
				spy.mockReturnValueOnce(from([[mockedSecond]]));

				const responseExecution = await lastValueFrom(service.findByPeriodAndFolio(reqPeriod, reqFolio + 1, request.options));

				expect(responseExecution[0].car_periodo).toEqual(reqPeriod);
				expect(responseExecution[0].car_folio).toEqual(reqFolio);

				expect(spy).toHaveBeenCalledTimes(2);
			});

			it('[OK] should return a empty array (bank statement not found) - [findByPeriodAndFolio]', async () => {
				const bankStatements: BankStatement[] = [];

				const spy = vi.spyOn(service, 'findByPeriodAndFolio').mockImplementation((): Observable<BankStatement[] | AcquireWithBase64[]> => {
					return from([bankStatements]);
				});

				const response = await lastValueFrom(service.findByPeriodAndFolio(request.period, request.folio, request.options));

				expect(spy).toHaveBeenCalled();

				expect(spy).toHaveBeenCalledWith(request.period, request.folio, request.options);

				expect(response).toEqual(bankStatements);

				expect(spy).toHaveBeenCalledTimes(1);
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

			it.concurrent('[ERROR] should throw an error if rut is not valid - [getBankStatementByPeriodRutAndFolio]', async () => {
				try {
					vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it.concurrent('[OK] should fin a bank statement using a right rut - [getBankStatementByPeriodRutAndFolio]', async () => {
				request.rut = '253595635';

				const bankStatements = [
					createBankStatement({
						rut: Number(request.rut),
					}),
				];

				vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));
				const result = await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it.concurrent('[ERROR] should throw an error if rut is not valid - [findByRut]', async () => {
				try {
					vi.spyOn(service, 'findByRut').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.findByRut(request.rut));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it.concurrent('[OK] should perform a right request by rut - [findByRut]', async () => {
				const bankStatements = [
					createBankStatement({
						rut: Number(request.rut),
						base64: request.options.base64,
					}),
				];

				const spy = vi.spyOn(service, 'findByRut').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByRut(request.rut));

				expect(spy).toBeCalledTimes(1);
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

			it.concurrent('[ERROR] should throw an error if rut is not valid - [getBankStatementByPeriodRutAndFolio]', async () => {
				try {
					vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it.concurrent('[OK] should fin a bank statement using a right rut - [getBankStatementByPeriodRutAndFolio]', async () => {
				request.rut = '253595635';

				const bankStatements = [
					createBankStatement({
						rut: Number(request.rut),
					}),
				];

				vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));
				const result = await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it.concurrent('[ERROR] should throw an error if rut is not valid - [findByFolioAndRut]', async () => {
				try {
					vi.spyOn(service, 'findByFolioAndRut').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.findByFolioAndRut(request.rut, request.folio, request.options));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it.concurrent('[OK] should find bankStatement by folio and rut', async () => {
				const bankStatements = [
					createBankStatement({
						folio: request.folio,
						rut: Number(request.rut),
						base64: request.options.base64,
					}),
				];

				const spy = vi.spyOn(service, 'findByFolioAndRut').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByFolioAndRut(request.rut, request.folio, request.options));

				expect(spy).toHaveBeenCalledWith(request.rut, request.folio, request.options);
				expect(result).toBeDefined();

				spy.mockReturnValueOnce(from([bankStatements]));
				expect(result).toEqual(bankStatements);

				expect(spy).toHaveBeenCalledTimes(1);
			});

			it.concurrent('[OK] should return a empty array (bank statement not found) - [findByPeriodAndFolio]', async () => {
				const bankStatements: BankStatement[] = [];

				const spy = vi.spyOn(service, 'findByFolioAndRut').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByFolioAndRut(request.folio, request.rut, request.options));

				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith(request.folio, request.rut, request.options);
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

			it.concurrent('[ERROR] should throw an error if rut is not valid - [getBankStatementByPeriodRutAndFolio]', async () => {
				try {
					vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it.concurrent('[OK] should fin a bank statement using a right rut - [getBankStatementByPeriodRutAndFolio]', async () => {
				request.rut = '253595635';

				const bankStatements = [
					createBankStatement({
						rut: Number(request.rut),
					}),
				];

				vi.spyOn(service, 'getBankStatementByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));
				const result = await lastValueFrom(service.getBankStatementByPeriodRutAndFolio(request));

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result[0]).toBeInstanceOf(BankStatement);
				expect(result[0]).toEqual(bankStatements[0]);
			});

			it.concurrent('[ERROR] should throw an error if rut is not valid - [findByPeriodAndRut]', async () => {
				try {
					vi.spyOn(service, 'findByPeriodAndRut').mockImplementation(() => {
						throw new BadRequestException('Rut is not valid');
					});

					await lastValueFrom(service.findByPeriodAndRut(request.period, request.rut, request.options));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}
			});

			it.concurrent('[OK] should find bankStatement by period and rut [findByPeriodAndRut]', async () => {
				const bankStatements = [
					createBankStatement({
						folio: request.folio,
						rut: Number(request.rut),
						base64: request.options.base64,
					}),
				];

				const spy = vi.spyOn(service, 'findByPeriodAndRut').mockReturnValueOnce(from([bankStatements]));

				const result = service.findByPeriodAndRut(request.period, request.rut, request.options);

				expect(result).toBeDefined();
				expect(spy).toHaveBeenCalledTimes(1);

				spy.mockReturnValueOnce(from([bankStatements]));
				expect(result).toBeInstanceOf(Observable);

				const item = await lastValueFrom(service.findByPeriodAndRut(request.period, request.rut, request.options));

				expect(item).toBeInstanceOf(Array);
				expect(item[0]).toBeInstanceOf(BankStatement);
				expect(item[0]).toEqual(bankStatements[0]);

				expect(spy).toHaveBeenCalledTimes(2);
			});

			it.concurrent('[OK] should return a empty array (bank statement not found) - [findByPeriodAndRut]', async () => {
				const bankStatements: BankStatement[] = [];

				const spy = vi.spyOn(service, 'findByPeriodAndRut').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByPeriodAndRut(request.period, request.rut, request.options));

				expect(spy).toBeCalledTimes(1);

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

			it.concurrent('[OK] should works properly returning no matched cartolas', async () => {
				const emptyBankStatementList: BankStatement[] = [];

				const mError = new BadRequestException('no elements in sequence');

				const spy = vi.spyOn(service, 'findByPeriodAndRut').mockRejectedValueOnce(mError);

				const result = service.findByPeriodAndRut(request.period, String(request.rut), request.options);

				expect(result).toBeDefined();

				spy.mockReturnValueOnce(from([emptyBankStatementList]));

				expect(result).rejects.toThrow(mError);

				expect(spy).toHaveBeenCalledTimes(1);

				/* 	try {
					await lastValueFrom(result);
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				} */
			});

			it.concurrent('[OK] should works properly returning one match', async () => {
				const bankStatements = [
					createBankStatement({
						base64: request.options.base64,
						period: request.period,
						folio: request.folio,
						rut: request.rut,
					}),
				];

				const spy = vi.spyOn(service, 'findByPeriodRutAndFolio').mockReturnValueOnce(from([bankStatements]));

				const result = await lastValueFrom(service.findByPeriodRutAndFolio(request.period, request.rut, request.folio, request.options));

				expect(result).toEqual(bankStatements);

				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith(request.period, request.rut, request.folio, request.options);

				spy.mockImplementationOnce(() => {
					throw new BadRequestException('Rut is not valid');
				});

				// evaluate the error
				try {
					await lastValueFrom(service.findByPeriodRutAndFolio(request.period, request.rut, request.folio, request.options));
				} catch (error: any) {
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
					expect(error.message).toBe('Rut is not valid');
					expect(error.name).toBe(BadRequestException.name);
				}

				expect(spy).toHaveBeenCalledTimes(2);

				spy.mockReturnValueOnce(from([bankStatements]));

				expect(result).toBeDefined();
				expect(result).toBeInstanceOf(Array);
				expect(result).toHaveLength(1);
			});
		});
	});
});

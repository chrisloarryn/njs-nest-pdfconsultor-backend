import { faker } from '@faker-js/faker';
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { from, lastValueFrom, mergeMap } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorRutFolioOptionsRequired, ErrorRutIsNotValid, ErrorSearchingOptionsRequired } from '@ccla/api/common/constants/errorConstants';

import { createBankStatement } from '../../../common/helpers';
import { AcquireWithBase64, BankStatement } from './../entities';
import { BankStatementRepository } from './../repository';
import { BankStatementOptions, BankStatementService } from './bank-statement.service';

describe('BankStatementService', () => {
	let service: BankStatementService;
	let repo: BankStatementRepository;
	let moduleRef: TestingModule;

	const request = {
		folio: faker.random.numeric(10),
		period: new Date().getFullYear() + faker.date.month(),
		rut: Number(faker.random.numeric(10)),
		options: {
			base64: false,
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

		moduleRef = await Test.createTestingModule({
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
		}).compile();

		repo = moduleRef.get<BankStatementRepository>(BankStatementRepository);
		service = new BankStatementService(repo);
	});

	describe('When Test Bank statement service [BS]', () => {
		describe('When Test getBankStatementsByPeriodRutAndFolio [BS-1]', () => {
			it('should throw when any options as parameters', async () => {
				const mockedErr = new BadRequestException(ErrorSearchingOptionsRequired);

				const find = vi.fn().mockReturnValueOnce(from([]));

				vi.spyOn(repo, 'getBankStatementsByPeriodRutAndFolio').mockImplementation(find);

				try {
					expect(() => lastValueFrom(service.getBankStatementsByPeriodRutAndFolio())).rejects.toThrowError(mockedErr);
				} catch (error: any) {
					expect(error).toBeInstanceOf(BadRequestException);
					expect(error.message).toBe(ErrorSearchingOptionsRequired);
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
				}
			});

			it('should throw when when rut nor folio option passed', async () => {
				const reqOptions: BankStatementOptions = {
					period: request.period,
					options: request.options,
				};

				const mockedErr = new BadRequestException(ErrorRutFolioOptionsRequired);

				const find = vi.fn().mockReturnValueOnce(from([]));

				vi.spyOn(repo, 'getBankStatementsByPeriodRutAndFolio').mockImplementation(find);

				try {
					expect(() => lastValueFrom(service.getBankStatementsByPeriodRutAndFolio(reqOptions))).rejects.toThrowError(mockedErr);
				} catch (error: any) {
					expect(error).toBeInstanceOf(BadRequestException);
					expect(error.message).toBe(ErrorRutFolioOptionsRequired);
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
				}
			});

			it('should throw when when not valid rut passed', async () => {
				const reqOptions: BankStatementOptions = {
					rut: '123456789',
					options: request.options,
				};

				const mockedErr = new BadRequestException(ErrorRutIsNotValid);

				const find = vi.fn().mockReturnValueOnce(from([]));

				vi.spyOn(repo, 'getBankStatementsByPeriodRutAndFolio').mockImplementation(find);

				try {
					expect(() => lastValueFrom(service.getBankStatementsByPeriodRutAndFolio(reqOptions))).rejects.toThrowError(mockedErr);
				} catch (error: any) {
					expect(error).toBeInstanceOf(BadRequestException);
					expect(error.message).toBe(ErrorRutIsNotValid);
					expect(error.status).toBe(HttpStatus.BAD_REQUEST);
				}
			});
		});

		describe('When Test getPdfs using allowed options [getBankStatementsByPeriodRutAndFolio]', () => {
			it('should perform a search by period and folio', async () => {
				const bankStatements = [
					createBankStatement({
						period: request.period,
						folio: request.folio,
						base64: request.options.base64,
					}),
				];

				const find = vi.fn().mockReturnValueOnce(from([bankStatements]));

				vi.spyOn(repo, 'getPdfsByPeriodAndFolio').mockImplementation(find);

				try {
					const result = await lastValueFrom(
						service.getBankStatementsByPeriodRutAndFolio({
							period: request.period,
							folio: request.folio,
							options: request.options,
						}),
					);

					expect(result).toEqual(bankStatements);
				} catch (error: any) {
					expect(error).toBeUndefined();
				}
			});

			it('[OK] should perform a search by rut (period nor folio)', async () => {
				const rut = '189893280';

				const bankStatements = [
					createBankStatement({
						rut: Number(rut),
						base64: request.options.base64,
					}),
				];

				const find = vi.fn().mockReturnValueOnce(from([bankStatements]));
				vi.spyOn(repo, 'getPdfsByRut').mockImplementation(find);

				try {
					const result = await lastValueFrom(
						service.getBankStatementsByPeriodRutAndFolio({
							rut,
							options: request.options,
						}),
					);

					expect(result[0].car_url).toEqual(bankStatements[0].car_url);
				} catch (error: any) {
					expect(error).toBeUndefined();
				}
			});

			it('[OK] should perform a search by rut and folio', async () => {
				const rut = '189893280',
					folio = request.folio;

				const bankStatements = [
					createBankStatement({
						rut: Number(rut),
						folio,
						base64: request.options.base64,
					}),
				];

				const find = vi.fn().mockReturnValueOnce(from([bankStatements]));

				vi.spyOn(repo, 'getPdfsByFolioAndRut').mockImplementation(find);

				try {
					const result = await lastValueFrom(
						service.getBankStatementsByPeriodRutAndFolio({
							rut: String(rut),
							folio,
							options: request.options,
						}),
					);

					expect(result).toEqual(bankStatements);
				} catch (error: any) {
					expect(error).toBeUndefined();
				}
			});

			it('should perform a search by rut and period', async () => {
				const rut = '189893280',
					period = request.period;

				const bankStatements = [
					createBankStatement({
						rut: Number(rut),
						period,
						base64: request.options.base64,
					}),
				];

				const find = vi.fn().mockReturnValueOnce(from([bankStatements]));

				vi.spyOn(repo, 'getPdfsByPeriodAndRut').mockImplementation(find);

				try {
					const result = await lastValueFrom(
						service.getBankStatementsByPeriodRutAndFolio({
							rut: String(rut),
							period,
							options: request.options,
						}),
					);

					expect(result).toEqual(bankStatements);
				} catch (error: any) {
					expect(error).toBeUndefined();
				}
			});

			it('should perform a search by rut, folio and period', async () => {
				const rut = '189893280',
					period = request.period,
					folio = request.folio;

				const bankStatements = [
					createBankStatement({
						rut: Number(rut),
						period,
						folio,
						base64: request.options.base64,
					}),
				];

				const find = vi.fn().mockReturnValueOnce(from([bankStatements]));

				vi.spyOn(repo, 'getBankStatementsByPeriodRutAndFolio').mockImplementation(find);

				try {
					const result = await lastValueFrom(
						service.getBankStatementsByPeriodRutAndFolio({
							rut: String(rut),
							period,
							folio,
							options: request.options,
						}),
					);

					expect(result).toEqual(bankStatements);
				} catch (error: any) {
					expect(error).toBeUndefined();
				}
			});
		});

		describe('When perform handleObservableResponse function', () => {
			it('[OK] should return an array of bank statements [base64=false]', async () => {
				const bankStatements = [
					createBankStatement({
						rut: 189893280,
						base64: request.options.base64,
					}),
				];

				const result = service.handleObservableResponse(from([bankStatements]), {
					base64: request.options.base64,
				});

				const response = await lastValueFrom(result);

				expect(response[0]).toEqual(bankStatements[0]);
			});

			it('[ERROR] should throw not found', async () => {
				const mockedError = new NotFoundException('Bank statements not found');

				const result = service.handleObservableResponse(from([[]]), {
					base64: request.options.base64,
				});

				try {
					await lastValueFrom(result);
				} catch (error: any) {
					expect(error).toEqual(mockedError);
					expect(error.message).toEqual(mockedError.message);
				}
			});

			it('[ERROR] should throw an error', async () => {
				// create a observable that throws an error
				const mockedErr = new InternalServerErrorException('Error fetching data');
				const obs = from([mockedErr]).pipe(
					mergeMap(() => {
						throw mockedErr;
					}),
				);

				try {
					await lastValueFrom(
						service.handleObservableResponse(obs, {
							base64: request.options.base64,
						}),
					);
				} catch (error: any) {
					expect(error).toEqual(mockedErr);
					expect(error.message).toEqual(mockedErr.message);
					expect(error.status).toEqual(mockedErr.getStatus());
				}
			});

			it('[OK] should return an array of bank statements [base64=true]', async () => {
				const bankStatements = [
					createBankStatement({
						rut: 189893280,
						base64: true,
					}),
				];

				const convertToB64 = bankStatements[0].car_url;
				const b64String = Buffer.from(convertToB64).toString('base64');

				vi.spyOn(service, 'getPdfAsBase64').mockReturnValueOnce(from([b64String]));

				const result = service.handleObservableResponse(from([bankStatements]), {
					base64: true,
				});

				const response = await lastValueFrom(result);

				const { base64, ...argsRes } = response[0] as AcquireWithBase64;
				const awaitedSubscription = await lastValueFrom(base64 as any);
				const responseModified = { ...argsRes, base64: awaitedSubscription };
				expect(responseModified).toEqual(bankStatements[0]);
			});
		});

		describe('When perform getPdfAsBase64 function', () => {
			it('[OK] should return a base64 string', async () => {
				const bankStatements = [
					createBankStatement({
						rut: 189893280,
						base64: true,
					}),
				];

				const convertToB64 = bankStatements[0].car_url;
				const b64String = Buffer.from(convertToB64).toString('base64');

				vi.spyOn(service, 'getPdfAsBase64').mockReturnValueOnce(from([b64String]));

				const result = service.getPdfAsBase64(bankStatements[0].car_url);

				const response = await lastValueFrom(result);

				expect(response).toEqual(b64String);
			});

			it('[ERROR] should throw an error', async () => {
				// create a observable that throws an error
				const mockedErr = new InternalServerErrorException('Error fetching pdf from url');
				const obs = from([mockedErr]).pipe(
					mergeMap(() => {
						throw mockedErr;
					}),
				);

				try {
					await lastValueFrom(service.getPdfAsBase64(obs as any));
				} catch (error: any) {
					expect(error).toEqual(mockedErr);
					expect(error.message).toEqual(mockedErr.message);
					expect(error.status).toEqual(mockedErr.getStatus());
				}
			});
		});
	});
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { catchError, from, last, lastValueFrom, map, Observable, throwIfEmpty, toArray } from 'rxjs';

import { parseStrToBase64 } from '../../../common/utils/b64.utils';
import { AcquireBankStatementUrl, AcquireWithBase64 } from '../entities';
import { BankStatementRepository } from '../repository';
import { BankStatementService } from '../service';
import { BankStatementController } from './bank-statement.controller';

const isEven = (n: number) => n % 2 === 0;

const makeBankStatement = (i: number): AcquireWithBase64 | AcquireBankStatementUrl => {
	const url = `car_url${i}`;
	if (isEven(i)) {
		//
		const b64 = parseStrToBase64(url);
		const bankStatement = new AcquireWithBase64();
		bankStatement.base64 = b64;
		bankStatement.car_url = url;
		bankStatement.car_folio = `car_folio${i}`;
		bankStatement.car_periodo = `car_periodo${i}`;
		bankStatement.car_rut = i;
		return plainToInstance(AcquireWithBase64, instanceToPlain(bankStatement));
	}

	const bankStatement = new AcquireBankStatementUrl();
	bankStatement.car_url = `car_url${i}`;
	bankStatement.car_folio = `car_folio${i}`;
	bankStatement.car_periodo = `car_periodo${i}`;
	bankStatement.car_rut = i;
	return plainToInstance(AcquireBankStatementUrl, instanceToPlain(bankStatement));
};

const randomBSByQuantity = (quantity: number): Observable<AcquireWithBase64[] | AcquireBankStatementUrl[]> =>
	from(Array(quantity).keys()).pipe(
		map((i) => makeBankStatement(i + 1)),
		toArray(),
	);

describe('BankStatementController', () => {
	let service: BankStatementService;
	let controller: BankStatementController;
	let testingModule: TestingModule;

	beforeEach(async () => {
		const bankStatements = randomBSByQuantity(7);
		const mockedBankStatementsService = {
			getBankStatementUrlByProcessIdAndFolio: jest.fn().mockImplementation((_rut: number, _car_folio: string) => {
				return bankStatements.pipe(
					// map((bs) => bs.filter((b) => b.prc_id === pid && b.car_folio === car_folio)),
					// map((bs) => bs[0]),
					last(),
				);
			}),
		};
		const mockedRepo = {
			getBankStatementUrlByProcessIdAndFolio: jest.fn().mockImplementation((rut: number, car_folio: string, period) =>
				bankStatements.pipe(
					map((bs) => bs.filter((b) => b.car_rut === rut && b.car_folio === car_folio && b.car_periodo === period)),
					last(),
				),
			),
		};
		const mockBankStatementsController = {
			getBankStatementByProcessIdAndFolio: jest.fn().mockImplementation((car_folio: string, period: string, rut: number, b64: boolean) =>
				/* It's a pipe that transforms the bank-statement into a base64 string if the `b64` parameter is
			true. */
				bankStatements.pipe(
					map((bs: AcquireWithBase64[] | AcquireBankStatementUrl[]) => {
						if (b64 && isEven(Number(rut))) {
							return bs.map((b) => {
								const bsB64 = plainToInstance(AcquireWithBase64, instanceToPlain(b));
								bsB64.base64 = parseStrToBase64(bsB64.car_url);
								return bsB64;
							});
						}

						return bs;
					}),
					map((bs: AcquireWithBase64[] | AcquireBankStatementUrl[]) => {
						const conditionalFilter = {
							...((car_folio && { car_folio }) || {}),
							...((period && { car_periodo: period }) || {}),
							...((rut && { car_rut: Number(rut) }) || {}),
							...((b64 && { b64 }) || {}),
						};
						type ConditionalFilterNB64 = keyof AcquireBankStatementUrl;
						type ConditionalFilterWB64 = keyof AcquireWithBase64;
						const e = bs.filter((b: AcquireWithBase64) => {
							const condition = Object.entries(conditionalFilter).every(([key, value]) => {
								const valueFromBToCompare = b[key as ConditionalFilterNB64 | ConditionalFilterWB64];
								if (typeof valueFromBToCompare === 'string') {
									return valueFromBToCompare === String(value);
								}

								if (typeof valueFromBToCompare === 'number') {
									return valueFromBToCompare === Number(value);
								}

								if (typeof valueFromBToCompare === 'boolean') {
									return valueFromBToCompare === Boolean(value);
								}

								if (typeof valueFromBToCompare === 'undefined') {
									return true;
								}

								return String(valueFromBToCompare) == String(value);
							});

							return condition;
						});

						if (!e || e.length === 0) {
							throw new Error('Bank Statement not found');
						}

						return e;
					}),
					throwIfEmpty(() => new Error('Bank Statement not found')),
					catchError((err) => {
						throw err;
					}),
					map((bs) => bs),
				),
			),
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
					provide: BankStatementController,
					useFactory: jest.fn(),
					useValue: mockBankStatementsController,
				},
				{
					provide: getRepositoryToken(AcquireWithBase64),
					useValue: mockedRepo,
				},
				{
					provide: WINSTON_MODULE_NEST_PROVIDER,
					useValue: { log: jest.fn() },
				},
			],
		}).compile();

		controller = testingModule.get<BankStatementController>(BankStatementController);
		service = testingModule.get<BankStatementService>(BankStatementService);
	});
	it('[OK] controller should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('[OK] service should be defined', () => {
		expect(service).toBeDefined();
	});

	it(`[OK] should retrieve a bank-statement by 'car_periodo', 'car_rut' and 'car_folio'. (no base64)`, async () => {
		const prc_id = 1,
			car_periodo = `car_periodo${prc_id}`,
			car_rut = `${prc_id}`,
			car_folio = `car_folio${prc_id}`,
			shouldHaveB64 = false;

		const bankStatements = await lastValueFrom(controller.getBankStatementByProcessIdAndFolio(car_folio, car_periodo, car_rut, shouldHaveB64));

		expect(bankStatements).toBeDefined();

		expect(bankStatements).toBeInstanceOf(Array);
		expect(bankStatements).toHaveLength(1);

		const [bankStatement] = bankStatements;

		expect(bankStatement.car_url).toBeDefined();
		expect(bankStatement.car_url).not.toBeNull();
		expect(bankStatement.car_url).not.toBe('');
		expect(bankStatement.car_url).not.toBe('null');
		expect(bankStatement.car_url).not.toBe('undefined');
		expect(bankStatement.car_url).not.toBe(' ');
		expect(bankStatement.car_url).toBe(`car_url${prc_id}`);

		const bankStatementB64Type = bankStatement as AcquireWithBase64;

		expect(bankStatementB64Type.base64).toBeUndefined();
	});

	it(`[OK] should retrieve a bank-statement by 'car_periodo', 'car_rut' and 'car_folio'. (with base64)`, async () => {
		const prc_id = 2,
			car_period = `car_periodo${prc_id}`,
			car_folio = `car_folio${prc_id}`,
			car_rut = `${prc_id}`,
			shouldHaveB64 = true;

		const bankStatements = await lastValueFrom(controller.getBankStatementByProcessIdAndFolio(car_folio, car_period, car_rut, shouldHaveB64));

		expect(bankStatements).toBeDefined();
		expect(bankStatements).toBeInstanceOf(Array);
		expect(bankStatements).toHaveLength(1);

		const [bankStatement] = bankStatements;

		expect(bankStatement.car_url).toBeDefined();
		expect(bankStatement.car_url).not.toBeNull();
		expect(bankStatement.car_url).not.toBe('');
		expect(bankStatement.car_url).not.toBe('null');
		expect(bankStatement.car_url).not.toBe('undefined');
		expect(bankStatement.car_url).not.toBe(' ');
		expect(bankStatement.car_url).toBe(`car_url${prc_id}`);

		const bankStatementB64Type = bankStatement as AcquireWithBase64;

		expect(bankStatementB64Type.base64).toBeDefined();
		expect(bankStatementB64Type.base64).not.toBeNull();
	});
});

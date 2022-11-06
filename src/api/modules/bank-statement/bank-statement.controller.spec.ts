import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { catchError, from, last, lastValueFrom, map, Observable, throwIfEmpty, toArray } from 'rxjs';

import { parseStrToBase64 } from '../../common/utils/b64.utils';
import { BankStatementRepository } from '../../repository';
import { BankStatementController } from './bank-statement.controller';
import { BankStatementService } from './bank-statement.service';
import { AcquireBankStatementUrl, AcquireWithBase64 } from './entities';

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
		bankStatement.prc_id = i;
		bankStatement.prd_id = `prd_id${i}`;
		return plainToInstance(AcquireWithBase64, instanceToPlain(bankStatement));
	}

	const bankStatement = new AcquireBankStatementUrl();
	bankStatement.car_url = `car_url${i}`;
	bankStatement.car_folio = `car_folio${i}`;
	bankStatement.prc_id = i;
	bankStatement.prd_id = `prd_id${i}`;
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
			getBankStatementUrlByProcessIdAndFolio: jest.fn().mockImplementation((pid: number, car_folio: string) => {
				console.log('pid: ' + pid + ', car_folio: ' + car_folio);
				return bankStatements.pipe(
					// map((bs) => bs.filter((b) => b.prc_id === pid && b.car_folio === car_folio)),
					// map((bs) => bs[0]),
					last(),
				);
			}),
		};
		const mockedRepo = {
			getBankStatementUrlByProcessIdAndFolio: jest.fn().mockImplementation((pid: number, car_folio: string) =>
				bankStatements.pipe(
					map((bs) => bs.find((b) => b.prc_id === pid && b.car_folio === car_folio)),
					last(),
				),
			),
		};
		const mockBankStatementsController = {
			getBankStatementByProcessIdAndFolio: jest.fn().mockImplementation((pid: number, car_folio: string, b64: boolean) =>
				/* It's a pipe that transforms the bank-statement into a base64 string if the `b64` parameter is
			true. */
				bankStatements.pipe(
					map((bs) => {
						if (b64 && isEven(pid)) {
							return bs.map((b) => {
								const bsB64 = plainToInstance(AcquireWithBase64, instanceToPlain(b));
								bsB64.base64 = parseStrToBase64(bsB64.car_url);
								return bsB64;
							});
						}

						return bs;
					}),
					map((bs) => {
						const e = bs.filter((b) => b.prc_id === pid && b.car_folio === car_folio);

						if (!e || e.length === 0) {
							throw new Error('Bank Statement not found');
						}

						return e;
					}),
					throwIfEmpty(() => new Error('Bank Statement not found')),
					catchError((err) => {
						throw err;
					}),
					map((bs) => bs[0]),
				),
			),

			// valid url
			//
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
			],
		}).compile();

		controller = testingModule.get<BankStatementController>(BankStatementController);
		service = testingModule.get<BankStatementService>(BankStatementService);
	});
	it('controller should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('service should be defined', () => {
		expect(service).toBeDefined();
	});

	it(`should retrieve a bank-statement by 'prc_id' and 'car_folio'. (no base64)`, async () => {
		const prc_id = 1,
			car_folio = `car_folio${prc_id}`,
			shouldHaveB64 = false;
		const bankStatement = await lastValueFrom(controller.getBankStatementByProcessIdAndFolio(prc_id, car_folio, shouldHaveB64));

		expect(bankStatement).toBeDefined();
		expect(bankStatement.car_url).toBeDefined();
		expect(bankStatement.car_url).not.toBeNull();
		expect(bankStatement.car_url).not.toBe('');
		expect(bankStatement.car_url).not.toBe('null');
		expect(bankStatement.car_url).not.toBe('undefined');
		expect(bankStatement.car_url).not.toBe(' ');
		expect(bankStatement.car_url).toBe(`car_url${prc_id}`);

		const bs = bankStatement as AcquireWithBase64;

		expect(bs.base64).toBeUndefined();
	});

	it(`should retrieve a bank-statement by 'prc_id' and 'car_folio'. (with base64)`, async () => {
		const prc_id = 2,
			car_folio = `car_folio${prc_id}`,
			shouldHaveB64 = true;
		const bankStatement = await lastValueFrom(controller.getBankStatementByProcessIdAndFolio(prc_id, car_folio, shouldHaveB64));

		expect(bankStatement).toBeDefined();
		expect(bankStatement.car_url).toBeDefined();
		expect(bankStatement.car_url).not.toBeNull();
		expect(bankStatement.car_url).not.toBe('');
		expect(bankStatement.car_url).not.toBe('null');
		expect(bankStatement.car_url).not.toBe('undefined');
		expect(bankStatement.car_url).not.toBe(' ');
		expect(bankStatement.car_url).toBe(`car_url${prc_id}`);

		const bs = bankStatement as AcquireWithBase64;

		expect(bs.base64).toBeDefined();
		expect(bs.base64).not.toBeNull();
	});
});

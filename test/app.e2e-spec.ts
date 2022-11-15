import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { WinstonModule } from 'nest-winston';
import { from, last, map, Observable, toArray } from 'rxjs';
import request from 'supertest';

import { BankStatementController } from '@ccla/api/modules/bank-statement/controller/bank-statement.controller';
import { parseStrToBase64 } from 'src/api/common/utils/b64.utils';

import { BankStatementRepository } from '../src/api/modules/bank-statement/repository/bank-statement.repository';
import { LoggerConfig } from '../src/config';
import { AcquireBankStatementUrl, AcquireWithBase64 } from './../src/api/modules/bank-statement/entities/b64.bank-statement.entity';
import { BankStatement } from './../src/api/modules/bank-statement/entities/bank-statement.entity';

const logger: LoggerConfig = new LoggerConfig();

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

describe('Test (e2e)', () => {
	let app: INestApplication;
	let mockBankStatement: BankStatement;

	beforeEach(async () => {
		const mockBankStatement = randomBSByQuantity(7);
		const mockBankStatementRepository = {
			getBankStatementUrlByProcessIdAndFolio: jest.fn().mockImplementation((pid: number, car_folio: string) =>
				mockBankStatement.pipe(
					map((bs) => bs.find((b) => b.prc_id === pid && b.car_folio === car_folio)),
					last(),
				),
			),
		};

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [WinstonModule.forRoot(logger.console())],
			controllers: [BankStatementController],
			providers: [BankStatementController, BankStatementRepository],
		})
			.overrideProvider(BankStatementRepository)
			.useValue(mockBankStatementRepository)
			.compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/bank-statements/processID/car_folio?b64=true (GET)', () => {
		return request(app.getHttpServer())
			.get('/bank-statements/1/AEDS1?b64=true')
			.expect(HttpStatus.OK)
			.expect('Content-Type', /json/)
			.expect(mockBankStatement);
	});

	afterAll(async () => {
		await app.close();
	});
});

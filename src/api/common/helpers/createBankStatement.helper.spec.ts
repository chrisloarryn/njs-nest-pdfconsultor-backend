import { beforeEach, describe, expect, it } from 'vitest';

import { AcquireBankStatementUrl, AcquireWithBase64, BankStatement } from '../../modules/bank-statement/entities';
import { FakeCreateBankStatementOptions } from './../types/create.type';
import { createBankStatement, createRepoBS } from './createBankStatement.helper';

describe('pgConfig', () => {
	let options: FakeCreateBankStatementOptions = {};
	beforeEach(() => {
		options = {};
	});
	describe('When configuration is ok', () => {
		it.concurrent('[OK] should be defined', () => {
			expect(options).toBeDefined();
		});
	});

	describe('when pdf should be base 64', () => {
		it('should return base64 type element in data managed', () => {
			options.base64 = true;

			const data = createBankStatement(options) as AcquireWithBase64;

			expect(data).toHaveProperty('base64');
			expect(data.base64).toMatch(/^(data:application\/pdf;base64,)?([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
		});

		it('should create default banksStatement element', () => {
			const data = createBankStatement(options) as AcquireWithBase64;

			expect(data.base64).toBeUndefined();
			expect(data.car_rut).toBeDefined();
		});

		it('should create a banksStatement element with default rut', () => {
			const data = createBankStatement(options) as AcquireWithBase64;

			expect(data.base64).toBeUndefined();
			expect(data.car_rut).toBeDefined();
			expect(String(data.car_rut)).toHaveLength(10);
		});

		it('should create custom banksStatement element', () => {
			options.bsName = 'test';
			options.folio = 'test';
			options.processID = 1;
			options.rut = 1;
			options.url = 'test';
			options.productID = 'test';
			options.period = 'test';

			const data = createBankStatement(options) as BankStatement;

			expect(data.prc_id).toBe(options.processID);
		});
	});

	describe('when fn createRepoBS creates elements', () => {
		it('should return a valid bank statement with empty values', () => {
			const data = createRepoBS(options);
			expect(data).toBeInstanceOf(Object);
			expect(data).toBeInstanceOf(AcquireBankStatementUrl);
		});
		it('should return a valid bank statement with custom values', () => {
			options.folio = 'test';
			options.period = 'test';
			options.rut = 123;
			options.url = 'test';

			const data = createRepoBS(options);
			expect(data).toBeInstanceOf(Object);
			expect(data).toBeInstanceOf(AcquireBankStatementUrl);
			expect(data.car_folio).toBe(options.folio);
			expect(data.car_periodo).toBe(options.period);
			expect(data.car_rut).toBe(options.rut);
			expect(data.car_url).toBe(options.url);
		});
		it('should return base64 type element in data managed', () => {
			options.base64 = true;

			const data = createBankStatement(options) as AcquireWithBase64;

			expect(data).toHaveProperty('base64');
			// validate data.base64 is a base64 string
			expect(data.base64).toMatch(/^(data:application\/pdf;base64,)?([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
		});

		it('should create a bankstatement with past date', () => {
			const data = createRepoBS({ ...options, dateOccurrence: 'past' });

			expect(data).toBeInstanceOf(Object);
			expect(data).toBeInstanceOf(AcquireBankStatementUrl);

			const date = new Date(data.created_at);
			const now = new Date();

			expect(date.getTime()).toBeLessThan(now.getTime());
		});

		it('should create a bankstatement with future date', () => {
			const data = createRepoBS({ ...options, dateOccurrence: 'future' });

			expect(data).toBeInstanceOf(Object);
			expect(data).toBeInstanceOf(AcquireBankStatementUrl);

			const date = new Date(data.created_at);
			const now = new Date();

			expect(date.getTime()).toBeGreaterThan(now.getTime());
		});

		it('should create a bankstatement with empty or invalid date', () => {
			const now = new Date('2022-02-10T11:47:00.911Z');

			const data = createRepoBS({ ...options, date: now });

			expect(data).toBeInstanceOf(Object);
			expect(data).toBeInstanceOf(AcquireBankStatementUrl);

			expect(data.created_at).toBe(now);
		});
	});
});

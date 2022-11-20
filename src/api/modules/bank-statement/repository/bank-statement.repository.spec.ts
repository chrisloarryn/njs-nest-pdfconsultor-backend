import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { from, lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorNoOccurrencesFound } from '../../../common/constants/errorConstants';
import { createBankStatement } from '../../../common/helpers/createBankStatement.helper';
import { BankStatement } from '../entities';
import { LoggerConfig } from './../../../../config';
import { BankStatementRepository } from './../repository';

const logger: LoggerConfig = new LoggerConfig();

describe('BankStatementRepository', () => {
	let bankStatementRepository: BankStatementRepository;
	let repo: Repository<BankStatement>;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			imports: [WinstonModule.forRoot(logger.console())],
			providers: [
				BankStatementRepository,
				{
					provide: getRepositoryToken(BankStatement),
					useValue: {
						createQueryBuilder: vi.fn(),
						find: vi.fn(),
					},
				},
			],
		}).compile();

		bankStatementRepository = app.get<BankStatementRepository>(BankStatementRepository);
		repo = app.get<Repository<BankStatement>>(getRepositoryToken(BankStatement));
	});

	describe("When declare repository and it's methods", () => {
		it.concurrent('[OK] should be defined', () => {
			expect(bankStatementRepository).toBeDefined();
			expect(repo).toBeDefined();
		});
	});

	describe('When get pdfs by rut', () => {
		it.concurrent('[OK] should find one', async () => {
			const rut = Number(faker.random.numeric(10));
			const bankStatement: BankStatement = createBankStatement({
				rut,
			}) as BankStatement;

			const find = vi.fn().mockReturnValueOnce(from([bankStatement]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			const result = await lastValueFrom(bankStatementRepository.getPdfsByRut(rut)); // await ;

			expect(result).toEqual(bankStatement);
		});

		it.concurrent("[ERROR] if rut doesn't exist should return no occurrences found", async () => {
			const rut = Number(faker.random.numeric(10));

			const find = vi.fn().mockReturnValueOnce(from([]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			expect(() => lastValueFrom(bankStatementRepository.getPdfsByRut(rut))).rejects.toThrowError(ErrorNoOccurrencesFound);
		});
	});

	describe('When get pdfs by folio', () => {
		it.concurrent('[OK] should find one', async () => {
			const folio = faker.random.alphaNumeric(10);
			const bankStatement: BankStatement = createBankStatement({
				folio,
			}) as BankStatement;

			const find = vi.fn().mockReturnValueOnce(from([bankStatement]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			const result = await lastValueFrom(bankStatementRepository.getPdfsByFolio(folio));

			expect(result).toEqual(bankStatement);
		});

		it.concurrent("[ERROR] if folio doesn't exist should return no occurrences found", async () => {
			const folio = faker.random.alphaNumeric(10);

			const find = vi.fn().mockReturnValueOnce(from([]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			expect(() => lastValueFrom(bankStatementRepository.getPdfsByFolio(folio))).rejects.toThrowError(ErrorNoOccurrencesFound);
		});
	});

	describe('When get pdfs by period and folio', () => {
		it.concurrent('[OK] should find one', async () => {
			const folio = faker.random.alphaNumeric(10);
			const period = faker.random.alphaNumeric(10);
			const bankStatement: BankStatement = createBankStatement({
				folio,
				period,
			}) as BankStatement;

			const find = vi.fn().mockReturnValueOnce(from([bankStatement]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			const result = await lastValueFrom(bankStatementRepository.getPdfsByPeriodAndFolio(period, folio));

			expect(result).toEqual(bankStatement);
		});

		it.concurrent("[ERROR] if period and folio doesn't exist should return no occurrences found", async () => {
			const folio = faker.random.alphaNumeric(10);
			const period = faker.random.alphaNumeric(10);

			const find = vi.fn().mockReturnValueOnce(from([]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			expect(() => lastValueFrom(bankStatementRepository.getPdfsByPeriodAndFolio(period, folio))).rejects.toThrowError(ErrorNoOccurrencesFound);
		});
	});

	describe('When get pdfs by folio and rut', () => {
		it.concurrent('[OK] should find one', async () => {
			const folio = faker.random.alphaNumeric(10);
			const rut = Number(faker.random.numeric(10));
			const bankStatement: BankStatement = createBankStatement({
				folio,
				rut,
			}) as BankStatement;

			const find = vi.fn().mockReturnValueOnce(from([bankStatement]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			const result = await lastValueFrom(bankStatementRepository.getPdfsByFolioAndRut(folio, rut));

			expect(result).toEqual(bankStatement);
		});

		it.concurrent("[ERROR] if folio and rut doesn't exist should return no occurrences found", async () => {
			const folio = faker.random.alphaNumeric(10);
			const rut = Number(faker.random.numeric(10));

			const find = vi.fn().mockReturnValueOnce(from([]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			expect(() => lastValueFrom(bankStatementRepository.getPdfsByFolioAndRut(folio, rut))).rejects.toThrowError(ErrorNoOccurrencesFound);
		});
	});

	// find by period and rut
	describe('When get pdfs by period and rut', () => {
		it.concurrent('[OK] should find one', async () => {
			const period = faker.random.alphaNumeric(10);
			const rut = Number(faker.random.numeric(10));
			const bankStatement: BankStatement = createBankStatement({
				period,
				rut,
			}) as BankStatement;

			const find = vi.fn().mockReturnValueOnce(from([bankStatement]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			const result = await lastValueFrom(bankStatementRepository.getPdfsByPeriodAndRut(period, rut));

			expect(result).toEqual(bankStatement);
		});

		it.concurrent("[ERROR] if period and rut doesn't exist should return no occurrences found", async () => {
			const period = faker.random.alphaNumeric(10);
			const rut = Number(faker.random.numeric(10));

			const find = vi.fn().mockReturnValueOnce(from([]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			expect(() => lastValueFrom(bankStatementRepository.getPdfsByPeriodAndRut(period, rut))).rejects.toThrowError(ErrorNoOccurrencesFound);
		});
	});

	// find by period, folio and rut
	describe('When get pdfs by period, folio and rut', () => {
		it.concurrent('[OK] should find one', async () => {
			const period = faker.random.alphaNumeric(10);
			const folio = faker.random.alphaNumeric(10);
			const rut = Number(faker.random.numeric(10));
			const bankStatement: BankStatement = createBankStatement({
				period,
				folio,
				rut,
			}) as BankStatement;

			const find = vi.fn().mockReturnValueOnce(from([bankStatement]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			const result = await lastValueFrom(bankStatementRepository.getBankStatementsByPeriodRutAndFolio(period, rut, folio));

			expect(result).toEqual(bankStatement);
		});

		it.concurrent("[ERROR] if period, folio and rut doesn't exist should return no occurrences found", async () => {
			const period = faker.random.alphaNumeric(10);
			const folio = faker.random.alphaNumeric(10);
			const rut = Number(faker.random.numeric(10));

			const find = vi.fn().mockReturnValueOnce(from([]));

			vi.spyOn(repo, 'find').mockImplementation(find);

			expect(() => lastValueFrom(bankStatementRepository.getBankStatementsByPeriodRutAndFolio(period, rut, folio))).rejects.toThrowError(
				ErrorNoOccurrencesFound,
			);
		});
	});
});

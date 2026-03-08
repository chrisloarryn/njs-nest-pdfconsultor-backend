import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetBankStatementsUseCase } from '@/modules/bank-statements/application/use-cases/get-bank-statements.use-case';
import type { BankStatementRepositoryPort } from '@/modules/bank-statements/domain/ports/bank-statement-repository.port';
import type { PdfBase64Port } from '@/modules/bank-statements/domain/ports/pdf-base64.port';
import { ErrorMessages } from '@/shared/domain/constants/error-messages';
import { createBankStatementSummary } from '@/shared/testing/factories/bank-statement.factory';

describe('GetBankStatementsUseCase', () => {
	let repository: BankStatementRepositoryPort;
	let pdfBase64: PdfBase64Port;
	let useCase: GetBankStatementsUseCase;

	beforeEach(() => {
		repository = {
			findByFolio: vi.fn(),
			findByFolioAndRut: vi.fn(),
			findByPeriodAndFolio: vi.fn(),
			findByPeriodAndRut: vi.fn(),
			findByPeriodRutAndFolio: vi.fn(),
			findByRut: vi.fn(),
		};

		pdfBase64 = {
			convert: vi.fn(),
		};

		useCase = new GetBankStatementsUseCase(repository, pdfBase64);
	});

	it('throws when options are missing', () => {
		expect(() => useCase.execute()).toThrow(BadRequestException);
	});

	it('throws when period is provided without rut or folio', () => {
		expect(() =>
			useCase.execute({
				options: { base64: false },
				period: '202401',
			}),
		).toThrow(ErrorMessages.rutFolioRequired);
	});

	it('throws when rut is invalid', () => {
		expect(() =>
			useCase.execute({
				options: { base64: false },
				rut: '123456789',
			}),
		).toThrow(ErrorMessages.rutIsNotValid);
	});

	it('returns results for period and folio searches', async () => {
		const summaries = [createBankStatementSummary({ folio: 'A1', period: '202401' })];
		vi.mocked(repository.findByPeriodAndFolio).mockReturnValue(of(summaries));

		const result = await lastValueFrom(
			useCase.execute({
				folio: 'A1',
				options: { base64: false },
				period: '202401',
			}),
		);

		expect(result).toEqual(summaries);
		expect(repository.findByPeriodAndFolio).toHaveBeenCalledWith('202401', 'A1');
	});

	it('adds base64 when requested', async () => {
		const summaries = [createBankStatementSummary({ url: 'https://example.com/cartola.pdf' })];
		vi.mocked(repository.findByRut).mockReturnValue(of(summaries));
		vi.mocked(pdfBase64.convert).mockReturnValue(of('YmFzZTY0'));

		const result = await lastValueFrom(
			useCase.execute({
				options: { base64: true },
				rut: '18.979.569-6',
			}),
		);

		expect(result).toEqual([
			{
				...summaries[0],
				base64: 'YmFzZTY0',
			},
		]);
	});

	it('throws not found when repository returns no items', async () => {
		vi.mocked(repository.findByFolio).mockReturnValue(of([]));

		await expect(
			lastValueFrom(
				useCase.execute({
					folio: 'A1',
					options: { base64: false },
				}),
			),
		).rejects.toThrow(NotFoundException);
	});

	it('maps unexpected repository failures to internal server error', async () => {
		vi.mocked(repository.findByFolio).mockReturnValue(throwError(() => new Error('boom')));

		await expect(
			lastValueFrom(
				useCase.execute({
					folio: 'A1',
					options: { base64: false },
				}),
			),
		).rejects.toThrow(InternalServerErrorException);
	});
});

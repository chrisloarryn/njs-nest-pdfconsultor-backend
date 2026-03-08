import { lastValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GetBankStatementsUseCase } from '@/modules/bank-statements/application/use-cases/get-bank-statements.use-case';
import { BankStatementsController } from '@/modules/bank-statements/presentation/controllers/bank-statements.controller';
import { createBankStatementSummary, createBankStatementWithBase64Summary } from '@/shared/testing/factories/bank-statement.factory';

describe('BankStatementsController', () => {
	let controller: BankStatementsController;
	let useCase: GetBankStatementsUseCase;

	beforeEach(() => {
		useCase = {
			execute: vi.fn(),
		} as unknown as GetBankStatementsUseCase;

		controller = new BankStatementsController(useCase, {
			debug: vi.fn(),
		} as never);
	});

	it('maps standard responses', async () => {
		const summary = createBankStatementSummary();
		vi.mocked(useCase.execute).mockReturnValue(of([summary]));

		const result = await lastValueFrom(controller.getBankStatements(undefined, summary.period ?? undefined, undefined, false));

		expect(result).toEqual([
			{
				car_folio: summary.folio,
				car_periodo: summary.period,
				car_rut: summary.rut,
				car_url: summary.url,
				created_at: summary.createdAt,
			},
		]);
	});

	it('maps base64 responses', async () => {
		const summary = createBankStatementWithBase64Summary();
		vi.mocked(useCase.execute).mockReturnValue(of([summary]));

		const result = await lastValueFrom(controller.getBankStatements(undefined, undefined, '18.979.569-6', true));

		expect(result).toEqual([
			{
				base64: summary.base64,
				car_folio: summary.folio,
				car_periodo: summary.period,
				car_rut: summary.rut,
				car_url: summary.url,
				created_at: summary.createdAt,
			},
		]);
	});
});

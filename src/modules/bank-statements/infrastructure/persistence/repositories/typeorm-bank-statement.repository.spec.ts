import { lastValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TypeormBankStatementRepository } from '@/modules/bank-statements/infrastructure/persistence/repositories/typeorm-bank-statement.repository';
import { createBankStatementOrmEntity } from '@/shared/testing/factories/bank-statement.factory';

describe('TypeormBankStatementRepository', () => {
	let repository: TypeormBankStatementRepository;
	const ormRepository = {
		find: vi.fn(),
	};

	beforeEach(() => {
		ormRepository.find.mockReset();
		repository = new TypeormBankStatementRepository(ormRepository as never);
	});

	it('maps entities into summaries', async () => {
		const entity = createBankStatementOrmEntity({
			car_folio: 'A1',
			car_periodo: '202401',
			car_rut: 18979569,
		});
		ormRepository.find.mockReturnValue(Promise.resolve([entity]));

		const result = await lastValueFrom(repository.findByPeriodAndFolio('202401', 'A1'));

		expect(result).toEqual([
			{
				createdAt: entity.created_at,
				folio: 'A1',
				period: '202401',
				rut: 18979569,
				url: entity.car_url,
			},
		]);
	});

	it('sends the expected where clause for rut searches', async () => {
		ormRepository.find.mockReturnValue(Promise.resolve([]));

		await lastValueFrom(repository.findByRut(12345678));

		expect(ormRepository.find).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					car_rut: 12345678,
				},
			}),
		);
	});
});

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, type Observable } from 'rxjs';
import { type FindOptionsWhere, Repository } from 'typeorm';

import type { BankStatementSummary } from '@/modules/bank-statements/domain/models/bank-statement.model';
import type { BankStatementRepositoryPort } from '@/modules/bank-statements/domain/ports/bank-statement-repository.port';
import { BankStatementOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/bank-statement.orm-entity';

@Injectable()
export class TypeormBankStatementRepository implements BankStatementRepositoryPort {
	constructor(
		@InjectRepository(BankStatementOrmEntity)
		private readonly repository: Repository<BankStatementOrmEntity>,
	) {}

	findByFolio(folio: string): Observable<BankStatementSummary[]> {
		return this.find({
			car_folio: folio,
		});
	}

	findByFolioAndRut(folio: string, rut: number): Observable<BankStatementSummary[]> {
		return this.find({
			car_folio: folio,
			car_rut: rut,
		});
	}

	findByPeriodAndFolio(period: string, folio: string): Observable<BankStatementSummary[]> {
		return this.find({
			car_folio: folio,
			car_periodo: period,
		});
	}

	findByPeriodAndRut(period: string, rut: number): Observable<BankStatementSummary[]> {
		return this.find({
			car_periodo: period,
			car_rut: rut,
		});
	}

	findByPeriodRutAndFolio(period: string, rut: number, folio: string): Observable<BankStatementSummary[]> {
		return this.find({
			car_folio: folio,
			car_periodo: period,
			car_rut: rut,
		});
	}

	findByRut(rut: number): Observable<BankStatementSummary[]> {
		return this.find({
			car_rut: rut,
		});
	}

	private find(where: FindOptionsWhere<BankStatementOrmEntity>): Observable<BankStatementSummary[]> {
		return from(
			this.repository.find({
				order: {
					created_at: 'DESC',
				},
				select: ['car_folio', 'car_url', 'car_periodo', 'car_rut', 'created_at'],
				where,
			}),
		).pipe(map((entities) => entities.map((entity) => this.toSummary(entity))));
	}

	private toSummary(entity: BankStatementOrmEntity): BankStatementSummary {
		return {
			createdAt: entity.created_at,
			folio: entity.car_folio,
			period: entity.car_periodo,
			rut: entity.car_rut,
			url: entity.car_url,
		};
	}
}

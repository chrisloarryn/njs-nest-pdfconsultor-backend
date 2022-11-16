import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';

import { AcquireBankStatementUrl, BankStatement } from '../entities';

@Injectable()
export class BankStatementRepository {
	constructor(@InjectRepository(BankStatement) private repository: Repository<BankStatement>) {}

	public getBankStatementsByPeriodRutAndFolio(period: string, rut: number, folio: string): Observable<AcquireBankStatementUrl[]> {
		return from(
			this.repository.find({
				where: { car_periodo: period, car_rut: rut, car_folio: folio },
				select: ['car_folio', 'car_url'],
			}),
		);
	}

	public getPdfsByPeriodAndRut(period: string, rut: number): Observable<AcquireBankStatementUrl[]> {
		return from(
			this.repository.find({
				where: { car_periodo: period, car_rut: rut },
				select: ['car_folio', 'car_url'],
			}),
		);
	}

	public getPdfsByFolioAndRut(folio: string, rut: number): Observable<AcquireBankStatementUrl[]> {
		return from(
			this.repository.find({
				where: { car_folio: folio, car_rut: rut },
				select: ['car_folio', 'car_url'],
			}),
		);
	}

	public getPdfsByPeriodAndFolio(period: string, folio: string): Observable<AcquireBankStatementUrl[]> {
		return from(
			this.repository.find({
				where: { car_periodo: period, car_folio: folio },
				select: ['car_folio', 'car_url'],
			}),
		);
	}

	public getPdfsByFolio(folio: string): Observable<AcquireBankStatementUrl[]> {
		return from(
			this.repository.find({
				where: { car_folio: folio },
				select: ['car_folio', 'car_url'],
			}),
		);
	}

	public getPdfsByRut(rut: number): Observable<AcquireBankStatementUrl[]> {
		return from(
			this.repository.find({
				where: { car_rut: rut },
				select: ['car_folio', 'car_url'],
			}),
		);
	}
}

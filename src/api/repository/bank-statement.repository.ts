import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { AcquireBankStatementUrl, BankStatement } from '../entities/bank-statement.entity';

@Injectable()
export class BankStatementRepository {
	constructor(@InjectRepository(BankStatement) private repository: Repository<BankStatement>) {}

	public getBankStatements(): Observable<BankStatement[]> {
		return from(this.repository.find());
	}

	public getBankStatementByProcessId(id: number): Observable<BankStatement> {
		return from(this.repository.findOneOrFail({ where: { prc_id: id } }));
	}

	public getBankStatementByProcessIdAndFolio(id: number, folio: string): Observable<AcquireBankStatementUrl> {
		return from(
			this.repository.findOneOrFail({
				where: { prc_id: id, car_folio: folio },
				select: ['prc_id', 'prd_id', 'car_folio', 'car_url'],
			}),
		);
	}

	// TODO: in this function there is an example of how to use relations
	// TODO: in this case, the relation is not necessary, but setting to true will return the relation
	// TODO: the relation is One to One, so it will return only one object or null
	public getBankStatementByProductId(id: string): Observable<BankStatement> {
		return from(
			this.repository.findOneOrFail({
				where: { prd_id: id },
			}),
		);
	}

	public createBankStatement(bankStatement: BankStatement): Observable<BankStatement> {
		return from(this.repository.save(bankStatement));
	}

	public updateBankStatementByProcessId(id: number, bankStatement: BankStatement): Observable<UpdateResult> {
		return from(this.repository.update({ prc_id: id }, bankStatement));
	}

	public updateBankStatementByProductId(id: string, bankStatement: BankStatement): Observable<UpdateResult> {
		return from(this.repository.update({ prd_id: id }, bankStatement));
	}

	public deleteBankStatementByProcessId(id: number): Observable<DeleteResult> {
		return from(this.repository.delete({ prc_id: id }));
	}

	public deleteBankStatementByProductId(id: string): Observable<DeleteResult> {
		return from(this.repository.delete({ prd_id: id }));
	}
}

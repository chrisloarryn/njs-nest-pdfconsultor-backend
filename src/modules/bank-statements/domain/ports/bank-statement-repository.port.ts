import type { Observable } from 'rxjs';

import type { BankStatementSummary } from '@/modules/bank-statements/domain/models/bank-statement.model';

export const BANK_STATEMENT_REPOSITORY = Symbol('BANK_STATEMENT_REPOSITORY');

export interface BankStatementRepositoryPort {
	findByFolio(folio: string): Observable<BankStatementSummary[]>;
	findByFolioAndRut(folio: string, rut: number): Observable<BankStatementSummary[]>;
	findByPeriodAndFolio(period: string, folio: string): Observable<BankStatementSummary[]>;
	findByPeriodAndRut(period: string, rut: number): Observable<BankStatementSummary[]>;
	findByPeriodRutAndFolio(period: string, rut: number, folio: string): Observable<BankStatementSummary[]>;
	findByRut(rut: number): Observable<BankStatementSummary[]>;
}

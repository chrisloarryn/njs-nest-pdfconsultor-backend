import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { catchError, forkJoin, map, mergeMap, type Observable, of, throwError } from 'rxjs';

import type { BankStatementBase64Summary, BankStatementSummary } from '@/modules/bank-statements/domain/models/bank-statement.model';
import type { BankStatementSearchCriteria } from '@/modules/bank-statements/domain/models/bank-statement-search-criteria';
import { BANK_STATEMENT_REPOSITORY, type BankStatementRepositoryPort } from '@/modules/bank-statements/domain/ports/bank-statement-repository.port';
import { PDF_BASE64_PORT, type PdfBase64Port } from '@/modules/bank-statements/domain/ports/pdf-base64.port';
import { ErrorMessages } from '@/shared/domain/constants/error-messages';
import { RutValidator } from '@/shared/domain/utils/rut-validator';

@Injectable()
export class GetBankStatementsUseCase {
	constructor(
		@Inject(BANK_STATEMENT_REPOSITORY)
		private readonly repository: BankStatementRepositoryPort,
		@Inject(PDF_BASE64_PORT)
		private readonly pdfBase64: PdfBase64Port,
	) {}

	execute(criteria?: BankStatementSearchCriteria): Observable<BankStatementSummary[] | BankStatementBase64Summary[]> {
		if (!criteria) {
			throw new BadRequestException(ErrorMessages.searchingOptionsRequired);
		}

		const { folio, period, rut, options } = criteria;
		if (period && !folio && !rut) {
			throw new BadRequestException(ErrorMessages.rutFolioRequired);
		}

		const normalizedRut = this.normalizeRut(rut);

		return this.resolveSearch(period, folio, normalizedRut).pipe(
			catchError((error: unknown) => {
				if (error instanceof NotFoundException || error instanceof BadRequestException) {
					return throwError(() => error);
				}

				return throwError(() => new InternalServerErrorException(ErrorMessages.fetchingData));
			}),
			mergeMap((results) => {
				if (results.length === 0) {
					return throwError(() => new NotFoundException(ErrorMessages.bankStatementsNotFound));
				}

				if (!options.base64) {
					return of(results);
				}

				return this.appendBase64(results);
			}),
		);
	}

	private appendBase64(items: BankStatementSummary[]): Observable<BankStatementBase64Summary[]> {
		return forkJoin(
			items.map((item) =>
				this.pdfBase64.convert(item.url).pipe(
					map((base64) => ({
						...item,
						base64,
					})),
				),
			),
		);
	}

	private normalizeRut(rut?: string): number | undefined {
		if (!rut) {
			return undefined;
		}

		if (!RutValidator.isValid(rut)) {
			throw new BadRequestException(ErrorMessages.rutIsNotValid);
		}

		const normalizedRut = RutValidator.normalize(rut);
		if (normalizedRut === null) {
			throw new BadRequestException(ErrorMessages.rutIsNotValid);
		}

		return normalizedRut;
	}

	private resolveSearch(period: string | undefined, folio: string | undefined, rut: number | undefined): Observable<BankStatementSummary[]> {
		if (period && folio && rut === undefined) {
			return this.repository.findByPeriodAndFolio(period, folio);
		}

		if (folio && period === undefined && rut === undefined) {
			return this.repository.findByFolio(folio);
		}

		if (rut !== undefined && !folio && !period) {
			return this.repository.findByRut(rut);
		}

		if (folio && rut !== undefined && !period) {
			return this.repository.findByFolioAndRut(folio, rut);
		}

		if (period && rut !== undefined && !folio) {
			return this.repository.findByPeriodAndRut(period, rut);
		}

		if (period && folio && rut !== undefined) {
			return this.repository.findByPeriodRutAndFolio(period, rut, folio);
		}

		return throwError(() => new BadRequestException(ErrorMessages.searchingOptionsRequired));
	}
}

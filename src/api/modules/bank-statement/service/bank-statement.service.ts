import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import pdf2base64 from 'pdf-to-base64';
import { catchError, from, map, Observable, retry } from 'rxjs';

import { ErrorFetchingData, ErrorFetchingPdfFromURL } from '@ccla/api/common/constants/errorConstants';

import { ValidadorRut } from './../../../common/utils/validador-rut';
import { BankStatementAdditionalInfoDTO } from './../dto/b64.bank-statement.dto';
import { AcquireBankStatementUrl, AcquireWithBase64 } from './../entities';
import { BankStatementRepository } from './../repository';

export type BankStatementOptions = {
	folio?: string;
	period?: string;
	rut?: string;
	options: BankStatementAdditionalInfoDTO;
};

@Injectable()
export class BankStatementService {
	constructor(private readonly repo: BankStatementRepository) {}
	getBankStatementsByPeriodRutAndFolio(bsOptions?: BankStatementOptions): Observable<AcquireWithBase64[] | AcquireBankStatementUrl[]> {
		if (!bsOptions) {
			throw new BadRequestException('Bank statement options are required');
		}
		const { folio, period, rut, options } = bsOptions;
		if (period && [!!rut, !!folio].filter(Boolean).length === 0) {
			// return error if is not valid
			throw new BadRequestException('rut or folio is required [BS]');
		}

		// if period and folio are provided, not rut needed
		if (period && folio && !rut) {
			const repoResponse = this.repo.getPdfsByPeriodAndFolio(period, folio);
			return this.handleObservableResponse(repoResponse, options);
		}

		// assuming rut exists and is valid
		if (rut && !ValidadorRut.isValid(rut)) {
			throw new BadRequestException('Rut is not valid');
		}

		const validatedRut = ValidadorRut.validateChileanRutAndGetOnlyNumbers(String(rut));

		//	if rut exists and is valid but folio and period does not exists
		if ([!!folio, !!period].filter(Boolean).length === 0) {
			const repoResponse = this.repo.getPdfsByRut(Number(validatedRut));
			return this.handleObservableResponse(repoResponse, options);
		}

		// if rut and folio exists
		if (folio && rut && !period) {
			const repoResponse = this.repo.getPdfsByFolioAndRut(folio, Number(rut));
			return this.handleObservableResponse(repoResponse, options);
		}

		// if rut and period exists only
		if (period && rut && !folio) {
			const repoResponse = this.repo.getPdfsByPeriodAndRut(period, Number(rut));
			return this.handleObservableResponse(repoResponse, options);
		}

		// if all params exists
		const repoResponse = this.repo.getBankStatementsByPeriodRutAndFolio(String(period), Number(rut), String(folio));
		return this.handleObservableResponse(repoResponse, options);
	}

	handleObservableResponse(
		observable: Observable<AcquireBankStatementUrl[]>,
		options: BankStatementAdditionalInfoDTO,
	): Observable<AcquireWithBase64[] | AcquireBankStatementUrl[]> {
		return observable.pipe(
			catchError(() => {
				throw new InternalServerErrorException(ErrorFetchingData);
			}),
			map((bankStatements: AcquireBankStatementUrl[]) => {
				if (bankStatements.length === 0) {
					throw new NotFoundException('Bank statements not found');
				}

				if (options?.base64) {
					return bankStatements.map((bankStatement: AcquireBankStatementUrl) => {
						return {
							...bankStatement,
							base64: this.getPdfAsBase64(bankStatement.car_url),
						};
					});
				}

				return bankStatements;
			}),
		);
	}

	getPdfAsBase64(url: string): Observable<string> {
		return from<string>(pdf2base64(url)).pipe(
			retry(3),
			catchError(() => {
				throw new InternalServerErrorException(ErrorFetchingPdfFromURL);
			}),
		);
	}
}

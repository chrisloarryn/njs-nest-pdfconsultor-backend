import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import pdf2base64 from 'pdf-to-base64';
import { catchError, from, map, Observable, retry } from 'rxjs';

import { ValidadorRut } from './../../../common/utils/validador-rut';
import { BankStatementAdditionalInfoDTO } from './../dto/b64.bank-statement.dto';
import { AcquireBankStatementUrl, AcquireWithBase64 } from './../entities';
import { BankStatementRepository } from './../repository';

type BankStatementOptions = {
	folio?: string;
	period?: string;
	rut?: string;
	options: BankStatementAdditionalInfoDTO;
};

@Injectable()
export class BankStatementService {
	constructor(private readonly repo: BankStatementRepository) {}
	getBankStatementsByPeriodRutAndFolio(bsOptions?: BankStatementOptions): Observable<AcquireWithBase64[] | AcquireBankStatementUrl[]> {
		console.log('bsOptions', bsOptions);
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
			return this.findByPeriodAndFolio(period, folio, options);
		}

		// assuming rut exists and is valid
		if (rut && !ValidadorRut.isValid(rut)) {
			throw new BadRequestException('Rut is not valid');
		}

		const validatedRut = ValidadorRut.validateChileanRutAndGetOnlyNumbers(String(rut));

		if (!validatedRut) {
			// return error if is not valid
			throw new BadRequestException('Rut is not valid');
		}

		//	if rut exists and is valid but folio and period does not exists
		if ([!!folio, !!period].filter(Boolean).length === 0) {
			return this.findByRut(validatedRut);
		}

		// if rut and folio exists
		if (folio && rut && !period) {
			return this.findByFolioAndRut(folio, validatedRut, options);
		}

		// if rut and period exists only
		if (period && rut && !folio) {
			return this.findByPeriodAndRut(period, validatedRut, options);
		}

		// if all params exists
		return this.findByPeriodRutAndFolio(String(period), Number(validatedRut), String(folio), options);
	}

	findByRut(rut: string): Observable<AcquireBankStatementUrl[] | AcquireWithBase64[]> {
		return this.repo.getPdfsByRut(Number(rut));
	}

	findByFolioAndRut(
		folio: string,
		rut: string,
		options: BankStatementAdditionalInfoDTO,
	): Observable<AcquireBankStatementUrl[] | AcquireWithBase64[]> {
		return this.handleObservableResponse(this.repo.getPdfsByFolioAndRut(folio, Number(rut)), options);
	}

	findByPeriodAndFolio(
		period: string,
		folio: string,
		options: BankStatementAdditionalInfoDTO,
	): Observable<AcquireBankStatementUrl[] | AcquireWithBase64[]> {
		const repoRes = this.repo.getPdfsByPeriodAndFolio(period, folio);
		return this.handleObservableResponse(repoRes, options);
	}

	findByPeriodAndRut(
		period: string,
		rut: string,
		options: BankStatementAdditionalInfoDTO,
	): Observable<AcquireBankStatementUrl[] | AcquireWithBase64[]> {
		return this.handleObservableResponse(this.repo.getPdfsByPeriodAndRut(period, Number(rut)), options);
	}

	findByPeriodRutAndFolio(
		period: string,
		rut: number,
		folio: string,
		options: BankStatementAdditionalInfoDTO,
	): Observable<AcquireBankStatementUrl[] | AcquireWithBase64[]> {
		return this.handleObservableResponse(this.repo.getBankStatementsByPeriodRutAndFolio(period, rut, folio), options);
	}

	handleObservableResponse(
		observable: Observable<AcquireBankStatementUrl[]>,
		options: BankStatementAdditionalInfoDTO,
	): Observable<AcquireWithBase64[] | AcquireBankStatementUrl[]> {
		return observable.pipe(
			catchError((error) => {
				throw new InternalServerErrorException(error);
			}),
			map((bankStatements: AcquireBankStatementUrl[]) => {
				if (bankStatements.length === 0) {
					throw new NotFoundException('Bank statement not found');
				}

				if (options?.base64) {
					return bankStatements.map((bankStatement: AcquireBankStatementUrl) => {
						return {
							...bankStatement,
							base64: from(pdf2base64(bankStatement.car_url)).pipe(
								retry(3),
								catchError((error) => {
									throw new InternalServerErrorException(error);
								}),
							),
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
			catchError((err) => {
				throw new InternalServerErrorException(err);
			}),
			map((pdf: string) => pdf),
		);
	}
}

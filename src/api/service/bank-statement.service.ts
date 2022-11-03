import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import pdf2base64 from 'pdf-to-base64';
import { catchError, from, map, Observable, retry, switchMap, throwIfEmpty } from 'rxjs';
import { DeleteResult, TypeORMError } from 'typeorm';

import { BankStatementAdditionalInfoDTO, BankStatementDTO } from '../dto/bank-statement.dto';
import { AcquireBankStatementUrl, AcquireWithBase64, BankStatement } from '../entities/bank-statement.entity';
import { BankStatementRepository } from '../repository';

@Injectable()
export class BankStatementService {
	constructor(private repo: BankStatementRepository) {}
	getBankStatementByProcessIdAndFolio(
		processId: number,
		folio: string,
		options: BankStatementAdditionalInfoDTO,
	): Observable<AcquireWithBase64 | AcquireBankStatementUrl> {
		return this.repo.getBankStatementByProcessIdAndFolio(processId, folio).pipe(
			retry(3),
			throwIfEmpty(() => new NotFoundException('BankStatement not found')),
			catchError((err) => {
				console.log('ERROR:::: ', err);
				throw new InternalServerErrorException(err);
			}),
			// concat result of getPdfAsBase64 using switchMap
			switchMap((bankStatement) => {
				if (!options.base64) return from([bankStatement]);
				const { car_url } = bankStatement;
				return from(pdf2base64(car_url)).pipe(
					map((base64) => {
						return {
							...bankStatement,
							base64: base64,
						};
					}),
				);
			}),
		);
	}

	#getPdfAsBase64(url: string): Observable<string> {
		return from<string>(pdf2base64(url)).pipe(
			retry(3),
			catchError((err) => {
				throw new InternalServerErrorException(err);
			}),
			map((pdf: string) => pdf),
		);
	}

	getBankStatementByProcessId(id: number): Observable<BankStatement> {
		return this.repo.getBankStatementByProcessId(id).pipe(
			retry(3),
			throwIfEmpty(() => new NotFoundException('BankStatement not found')),
			catchError((err) => {
				throw new InternalServerErrorException(err);
			}),
			map((bankStatement) => bankStatement),
		);
	}
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import pdfToBase64 from 'pdf-to-base64';
import { catchError, from, type Observable, retry, throwError } from 'rxjs';

import type { PdfBase64Port } from '@/modules/bank-statements/domain/ports/pdf-base64.port';
import { ErrorMessages } from '@/shared/domain/constants/error-messages';

@Injectable()
export class PdfToBase64Adapter implements PdfBase64Port {
	convert(url: string): Observable<string> {
		const convertPdfToBase64 = pdfToBase64 as (pdfUrl: string) => Promise<string>;

		return from(convertPdfToBase64(url)).pipe(
			retry({ count: 3 }),
			catchError(() => throwError(() => new InternalServerErrorException(ErrorMessages.fetchingPdfFromUrl))),
		);
	}
}

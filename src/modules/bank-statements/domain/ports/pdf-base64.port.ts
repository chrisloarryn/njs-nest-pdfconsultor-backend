import type { Observable } from 'rxjs';

export const PDF_BASE64_PORT = Symbol('PDF_BASE64_PORT');

export interface PdfBase64Port {
	convert(url: string): Observable<string>;
}

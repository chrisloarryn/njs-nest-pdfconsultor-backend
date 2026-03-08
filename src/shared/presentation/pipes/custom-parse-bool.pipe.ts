import { HttpStatus, Injectable, Optional, type PipeTransform } from '@nestjs/common';
import { type ErrorHttpStatusCode, HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

export interface ParseBoolPipeOptions {
	errorHttpStatusCode?: ErrorHttpStatusCode;
	exceptionFactory?: (error: string) => unknown;
}

type SupportedValue = boolean | number | string | null | undefined;

@Injectable()
export class CustomParseBoolPipe implements PipeTransform<SupportedValue | SupportedValue[], boolean> {
	private readonly exceptionFactory: (error: string) => unknown;

	constructor(@Optional() options?: ParseBoolPipeOptions) {
		const errorHttpStatusCode = options?.errorHttpStatusCode ?? HttpStatus.BAD_REQUEST;
		this.exceptionFactory = options?.exceptionFactory ?? ((error) => new HttpErrorByCode[errorHttpStatusCode](error));
	}

	transform(value: SupportedValue | SupportedValue[]): boolean {
		const candidate = Array.isArray(value) ? value[0] : value;

		if (candidate === undefined || candidate === null || candidate === 'null' || candidate === 'undefined') {
			return false;
		}

		if (candidate === true || candidate === 'true' || candidate === 1 || candidate === '1') {
			return true;
		}

		if (candidate === false || candidate === 'false' || candidate === 0 || candidate === '0') {
			return false;
		}

		throw this.exceptionFactory(`Validation failed (${String(candidate)} cannot be parsed to boolean)`);
	}
}

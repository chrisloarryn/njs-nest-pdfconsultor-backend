import { Injectable, PipeTransform, Optional, HttpStatus } from '@nestjs/common';
import { ErrorHttpStatusCode, HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

export interface ParseBoolPipeOptions {
	errorHttpStatusCode?: ErrorHttpStatusCode;
	exceptionFactory?: (error: string) => any;
}

type AvailableCustomBoolPipeTypes = string | number | boolean | null | undefined;
export type AvailableCustomBoolPipeArrayTypes = string[] | number[] | boolean[] | null[] | undefined[];

/**
 * Defines the built-in ParseBool Pipe
 *
 * @see [Built-in Pipes](https://docs.nestjs.com/pipes#built-in-pipes)
 *
 * @publicApi
 */
@Injectable()
export class CustomParseBoolPipe implements PipeTransform<AvailableCustomBoolPipeTypes, Promise<boolean>> {
	protected exceptionFactory: (error: string) => any;

	constructor(@Optional() options?: ParseBoolPipeOptions) {
		options = options || {};
		const { exceptionFactory, errorHttpStatusCode = HttpStatus.BAD_REQUEST } = options;
		this.exceptionFactory = exceptionFactory || ((error) => new HttpErrorByCode[errorHttpStatusCode](error));
	}

	/**
	 * Method that accesses and performs optional transformation on argument for
	 * in-flight requests.
	 *
	 * @param value currently processed route argument
	 * @param metadata contains metadata about the currently processed route argument
	 */
	async transform(value: AvailableCustomBoolPipeTypes | AvailableCustomBoolPipeArrayTypes): Promise<boolean> {
		let result: AvailableCustomBoolPipeTypes;

		if (Array.isArray(value)) {
			const [first] = value;
			result = first;
		} else {
			result = value;
		}

		if (this.isTrue(result)) {
			return true;
		}
		if (this.isFalse(result)) {
			return false;
		}
		throw this.exceptionFactory(`Validation failed (${value} cannot be parsed to boolean)`);
	}

	/**
	 * @param value currently processed route argument
	 * @returns `true` if `value` is said 'true', ie., if it is equal to the boolean
	 * `true` or the string `"true"`
	 */
	protected isTrue(value: AvailableCustomBoolPipeTypes): boolean {
		return value === true || value === 'true' || value === '1' || value === 1;
	}

	/**
	 * @param value currently processed route argument
	 * @returns `true` if `value` is said 'false', ie., if it is equal to the boolean
	 * `false` or the string `"false"`
	 */
	protected isFalse(value: AvailableCustomBoolPipeTypes): boolean {
		return value === false || value === 'false' || value === '0' || value === 0 || value == null || value === 'null' || value === 'undefined';
	}
}

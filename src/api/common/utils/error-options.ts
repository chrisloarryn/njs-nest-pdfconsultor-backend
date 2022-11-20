import { HttpException, HttpStatus } from '@nestjs/common';
import { Logger } from 'winston';

import { ErrorResponse, InvalidParametersErrorResponse } from '../../core/response';

import { LogsOptions } from '.';

export class ErrorOptions {
	public static noContent(_logger: Logger, _req: Request, _exception: HttpException): ErrorResponse {
		const objError = new ErrorResponse();
		objError.title = 'No Content';
		objError.detail = _exception.message || 'No Content Exception';
		objError.type = getUrlSwaggerEnv();
		objError.status = HttpStatus.NO_CONTENT;
		objError.codigoDeError = HttpStatus.NO_CONTENT;

		const id_transaccion = (_req.headers as any)['id-transaccion'] || (_req.headers as any)['Id-Transaccion'];

		if (id_transaccion) {
			LogsOptions.errorWithId(_logger, id_transaccion, objError.status, objError);
		} else {
			LogsOptions.error(_logger, objError.status, objError.detail, objError);
		}
		return objError;
	}

	public static badRequest(_logger: Logger, _req: Request, _exception: HttpException): ErrorResponse {
		const objError = new ErrorResponse();

		objError.title = 'Bad Request';
		objError.detail = (_exception as any)['detail'] ?? (_exception.message || 'Bad Request Exception');
		objError.type = getUrlSwaggerEnv();
		objError.status = HttpStatus.BAD_REQUEST;
		objError.codigoDeError = HttpStatus.BAD_REQUEST;

		const invalidParamsList = Array<InvalidParametersErrorResponse>();

		const exceptionIsArray = Array.isArray(
			typeof _exception.getResponse() === 'string'
				? JSON.parse(_exception.getResponse() as string)
				: (_exception.getResponse() as { message: any }).message,
		);

		const messages = (_exception.getResponse() as { message: any }).message;
		if (exceptionIsArray && messages.length > 0) {
			messages.forEach((key: any) => {
				const lastValidCaracter: number = key.indexOf('{');
				const result: string = key.substring(lastValidCaracter);

				const objStr = isJson(result) ? JSON.parse(result) : { name: 'undefined', reason: result };
				const invalidParams: InvalidParametersErrorResponse = {
					name: objStr.name,
					reason: objStr.reason,
				};
				if (!invalidParamsList.some((x) => x.name === invalidParams.name)) {
					invalidParamsList.push(invalidParams);
				}
			});
		}

		if (objError['invalid-params']) objError.detail = 'Bad Request Exception';

		const id_transaccion = (_req.headers as any)['id-transaccion'] || (_req.headers as any)['Id-Transaccion'];

		if (!id_transaccion) {
			const invalidParams: InvalidParametersErrorResponse = {
				name: 'Id-Transaccion',
				reason: 'Id-Transaccion debe existir y ser valido',
			};
			invalidParamsList.push(invalidParams);
		}

		objError['invalid-params'] = invalidParamsList;

		if (id_transaccion) {
			LogsOptions.errorWithId(_logger, id_transaccion, objError.status, objError);
		} else {
			LogsOptions.error(_logger, objError.status, objError.detail, objError);
		}

		return objError;
	}

	public static notFound(_logger: Logger, _req: Request, _exception: HttpException): ErrorResponse {
		const objError = new ErrorResponse();
		objError.title = 'Not Found';
		objError.detail = _exception.message || 'Not Found Exception';
		objError.type = getUrlSwaggerEnv();
		objError.status = HttpStatus.NOT_FOUND;
		objError.codigoDeError = HttpStatus.NOT_FOUND;

		const id_transaccion = (_req.headers as any)['id-transaccion'] || (_req.headers as any)['Id-Transaccion'];

		if (id_transaccion) {
			LogsOptions.errorWithId(_logger, id_transaccion, objError.status, objError);
		} else {
			LogsOptions.error(_logger, objError.status, objError.detail, objError);
		}

		return objError;
	}

	// unauthorized
	public static unauthorized(_logger: Logger, _req: Request, _exception: HttpException): ErrorResponse {
		const objError = new ErrorResponse();
		objError.title = 'Unauthorized';
		objError.detail = _exception.message || 'Unauthorized Exception';
		objError.type = getUrlSwaggerEnv();
		objError.status = HttpStatus.UNAUTHORIZED;
		objError.codigoDeError = HttpStatus.UNAUTHORIZED;

		const id_transaccion = (_req.headers as any)['id-transaccion'] || (_req.headers as any)['Id-Transaccion'];

		if (id_transaccion) {
			LogsOptions.errorWithId(_logger, id_transaccion, objError.status, objError);
		} else {
			LogsOptions.error(_logger, objError.status, objError.detail, objError);
		}

		return objError;
	}

	// forbidden
	public static forbidden(_logger: Logger, _req: Request, _exception: HttpException): ErrorResponse {
		const objError = new ErrorResponse();
		objError.title = 'Forbidden';
		objError.detail = _exception.message || 'Forbidden Exception';
		objError.type = getUrlSwaggerEnv();
		objError.status = HttpStatus.FORBIDDEN;
		objError.codigoDeError = HttpStatus.FORBIDDEN;

		const id_transaccion = (_req.headers as any)['id-transaccion'] || (_req.headers as any)['Id-Transaccion'];

		if (id_transaccion) {
			LogsOptions.errorWithId(_logger, id_transaccion, objError.status, objError);
		} else {
			LogsOptions.error(_logger, objError.status, objError.detail, objError);
		}

		return objError;
	}

	// conflict
	public static conflict(_logger: Logger, _req: Request, _exception: HttpException): ErrorResponse {
		const objError = new ErrorResponse();
		objError.title = 'Conflict';
		objError.detail = _exception.message || 'Conflict Exception';
		objError.type = getUrlSwaggerEnv();
		objError.status = HttpStatus.CONFLICT;
		objError.codigoDeError = HttpStatus.CONFLICT;

		const id_transaccion = (_req.headers as any)['id-transaccion'] || (_req.headers as any)['Id-Transaccion'];

		if (id_transaccion) {
			LogsOptions.errorWithId(_logger, id_transaccion, objError.status, objError);
		} else {
			LogsOptions.error(_logger, objError.status, objError.detail, objError);
		}

		return objError;
	}

	public static internalServerError(_logger: Logger, _req: Request, _exception: HttpException): ErrorResponse {
		const objError = new ErrorResponse();
		objError.title = 'Internal Server Error';
		objError.detail = _exception.message || 'Internal Server Error Exception';
		objError.type = getUrlSwaggerEnv();
		objError.status = HttpStatus.INTERNAL_SERVER_ERROR;
		objError.codigoDeError = HttpStatus.INTERNAL_SERVER_ERROR;

		const id_transaccion: string = (_req.headers as any)['id-transaccion'] || (_req.headers as any)['Id-Transaccion'];

		if (id_transaccion) {
			LogsOptions.errorWithId(_logger, id_transaccion, objError.status, objError);
		} else {
			LogsOptions.error(_logger, objError.status, objError.detail, objError);
		}

		return objError;
	}
}

function getUrlSwaggerEnv(): string {
	return process.env.ERROR_FILTER_TYPE || '';
}

function isJson(str: string) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

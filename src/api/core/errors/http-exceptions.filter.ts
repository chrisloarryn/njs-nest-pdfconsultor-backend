import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { loggers } from 'winston';

import { ErrorOptions } from '../../common/utils/error-options';
import { ErrorResponse } from '../response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus ? exception.getStatus() : 500;
		const request = ctx.getRequest<Request>();
		const logger = loggers.get('winston-logger');

		let objError = new ErrorResponse();
		if (status == HttpStatus.NO_CONTENT) objError = ErrorOptions.noContent(logger, request, exception);
		if (status == HttpStatus.BAD_REQUEST) objError = ErrorOptions.badRequest(logger, request, exception);
		if (status == HttpStatus.NOT_FOUND) objError = ErrorOptions.notFound(logger, request, exception);
		if (status != HttpStatus.NO_CONTENT && status != HttpStatus.BAD_REQUEST && status != HttpStatus.NOT_FOUND) {
			objError = ErrorOptions.internalServerError(logger, request, exception);
		}

		response.status(status).json({
			$schema: 'http://json-schema.org/draft-04/schema#',
			description: 'Esquema JSON de respuesta para casos de Error o Falla.',
			type: 'object',
			properties: objError,
		});
	}
}

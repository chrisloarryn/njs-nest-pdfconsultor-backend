import { ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Logger } from 'winston';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: Logger) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const context = host.switchToHttp();
		const response = context.getResponse<Response>();
		const request = context.getRequest<Request>();
		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
		const message =
			typeof exceptionResponse === 'string'
				? exceptionResponse
				: typeof exceptionResponse === 'object' && exceptionResponse && 'message' in exceptionResponse
					? exceptionResponse.message
					: 'Internal server error';

		this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));

		response.status(status).json({
			error: HttpStatus[status] ?? 'Error',
			message,
			path: request.url,
			statusCode: status,
			timestamp: new Date().toISOString(),
		});
	}
}

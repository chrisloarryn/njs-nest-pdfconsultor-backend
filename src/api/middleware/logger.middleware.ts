import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const RequestIp = require('@supercharge/request-ip');

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

	use(req: Request, res: Response, next: NextFunction) {
		const ip = RequestIp.getClientIp(res);
		this.logger.info(`Request...${req.method} ${req.url} ${ip}`);
		this.logger.debug(`${req.headers.get('user-agent')} ${JSON.stringify(req.body)}`);
		next();
	}
}

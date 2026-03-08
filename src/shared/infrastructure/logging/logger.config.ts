import path from 'node:path';

import type { WinstonModuleOptions } from 'nest-winston';
import winston from 'winston';

export function createWinstonOptions(serviceName = 'njs-nest-pdfconsultor-backend'): WinstonModuleOptions {
	const transports: winston.transport[] = [
		new winston.transports.Console({
			level: process.env.LOG_LEVEL ?? 'info',
		}),
	];

	if (process.env.GCP_PROJECT_ID && process.env.GCP_KEY_JSON && process.env.LOG_ENV !== 'feature') {
		const { LoggingWinston } = require('@google-cloud/logging-winston') as {
			LoggingWinston: new (options: Record<string, unknown>) => unknown;
		};

		transports.push(
			new LoggingWinston({
				keyFilename: path.join(process.cwd(), `keys/${process.env.GCP_KEY_JSON}`),
				logName: process.env.LOG_NAME ?? `${serviceName}-log`,
				prefix: process.env.LOG_SERVICE ?? `${serviceName}-service`,
				projectId: process.env.GCP_PROJECT_ID,
				redirectToStdout: true,
			}) as unknown as winston.transport,
		);
	}

	return {
		exitOnError: false,
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.errors({ stack: true }),
			winston.format.printf(({ level, message, stack, timestamp }) => {
				const renderedMessage = typeof stack === 'string' ? stack : stack instanceof Error ? (stack.stack ?? stack.message) : String(message);
				return `${String(timestamp)} [${String(level)}] ${renderedMessage}`;
			}),
		),
		transports,
	};
}

import * as path from 'path';

import { LoggingWinston } from '@google-cloud/logging-winston';
import winston, { format, loggers, transports } from 'winston';

export class LoggerConfig {
	private readonly options: winston.LoggerOptions;

	constructor() {
		const transportsList = [];

		transportsList.push(new transports.Console({ level: process.env.LOG_LEVEL })); // alert > error > warning > notice > info > debug
		transportsList.push(new transports.File({ filename: 'dist/logs/error.log', level: 'error' }));
		transportsList.push(new transports.File({ filename: 'dist/logs/logger.log' }));

		if (process.env.LOG_ENV && process.env.LOG_ENV != 'feature') {
			const loggingWinston = new LoggingWinston({
				projectId: process.env.GCP_PROJECT_ID,
				keyFilename: path.join(process.cwd(), `keys/${process.env.GCP_KEY_JSON}`),
				prefix: process.env.LOG_SERVICE || 'msusecases_services',
				logName: process.env.LOG_NAME || 'msusecases_log',
				redirectToStdout: true, //comment this line for local tests on GCP
			});
			transportsList.push(loggingWinston);
		}

		this.options = {
			exitOnError: false,
			format: format.combine(
				format.colorize(),
				format.timestamp(),
				format.printf((msg) => {
					return `${msg.timestamp} [${msg.level}] - ${msg.message}`;
				}),
			),
			transports: transportsList,
		};

		loggers.add('winston-logger', this.options);
	}

	public console() {
		return this.options;
	}
}

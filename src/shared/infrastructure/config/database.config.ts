import { registerAs } from '@nestjs/config';

export type DatabaseDriver = 'pg-mem' | 'postgres';

export interface DatabaseConfig {
	database: string;
	driver: DatabaseDriver;
	host: string;
	logging: boolean;
	password: string;
	port: number;
	synchronize: boolean;
	username: string;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
	if (value === undefined) {
		return fallback;
	}

	return value === 'true';
}

export default registerAs(
	'database',
	(): DatabaseConfig => ({
		database: process.env.POSTGRES_DB ?? 'pdfconsultor',
		driver: (process.env.DATABASE_DRIVER as DatabaseDriver | undefined) ?? 'postgres',
		host: process.env.POSTGRES_HOST ?? 'localhost',
		logging: parseBoolean(process.env.POSTGRES_LOGGING, false),
		password: process.env.POSTGRES_PASS ?? 'postgres',
		port: Number(process.env.POSTGRES_PORT ?? 5432),
		synchronize: parseBoolean(process.env.POSTGRES_SYNCHRONIZE, false),
		username: process.env.POSTGRES_USER ?? 'postgres',
	}),
);

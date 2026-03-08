import { describe, expect, it } from 'vitest';

import { validateEnv } from '@/shared/infrastructure/config/env.validation';
import { createTypeOrmModuleOptions } from '@/shared/infrastructure/config/typeorm.config';

describe('database configuration', () => {
	it('validates required environment variables', () => {
		const env = validateEnv({
			PORT: '3000',
			POSTGRES_DB: 'pdfconsultor',
			POSTGRES_HOST: 'localhost',
			POSTGRES_PASS: 'postgres',
			POSTGRES_PORT: '5432',
			POSTGRES_USER: 'postgres',
		});

		expect(env.PORT).toBe(3000);
		expect(env.GLOBAL_PREFIX).toBe('cartolab');
	});

	it('creates postgres options with driver metadata', () => {
		const options = createTypeOrmModuleOptions({
			database: 'pdfconsultor',
			driver: 'pg-mem',
			host: 'localhost',
			logging: false,
			password: 'postgres',
			port: 5432,
			synchronize: true,
			username: 'postgres',
		});

		expect(options.type).toBe('postgres');
		expect(options.extra).toEqual({ driver: 'pg-mem' });
		expect(options.synchronize).toBe(true);
	});
});

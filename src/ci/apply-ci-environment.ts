const defaultCiEnvironment: Record<string, string> = {
	DATABASE_DRIVER: 'pg-mem',
	GLOBAL_PREFIX: 'cartolab',
	LOG_LEVEL: 'error',
	NODE_ENV: 'test',
	PORT: '3000',
	POSTGRES_DB: 'pdfconsultor',
	POSTGRES_HOST: 'localhost',
	POSTGRES_LOGGING: 'false',
	POSTGRES_PASS: 'postgres',
	POSTGRES_PORT: '5432',
	POSTGRES_SYNCHRONIZE: 'true',
	POSTGRES_USER: 'postgres',
	SWAGGER_CONTACT_EMAIL: 'arquitectura@example.com',
	SWAGGER_CONTACT_NAME: 'Arquitectura',
	SWAGGER_DESCRIPTION: 'API para consulta de cartolas PDF',
	SWAGGER_NAME: 'PDF Consultor API',
	SWAGGER_URL: 'api-docs',
	SWAGGER_VERSION: '1.0.0',
};

export function applyCiEnvironment(): void {
	for (const [key, value] of Object.entries(defaultCiEnvironment)) {
		process.env[key] ??= value;
	}
}

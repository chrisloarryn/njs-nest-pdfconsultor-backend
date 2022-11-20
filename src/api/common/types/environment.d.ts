export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			SWAGGER_CONTACT_NAME: string;
			PORT: string | number;
			NODE_ENV: 'development' | 'qa' | 'staging' | 'production' | 'test';
			POSTGRES_HOST: string;
			POSTGRES_PORT: string;
			POSTGRES_USER: string;
			POSTGRES_PASS: string;
			POSTGRES_DB: string;
			POSTGRES_SCHEMA: string;
			POSTGRES_SYNCHRONIZE: string;
			POSTGRES_LOGGING: string;
			SWAGGER_NAME: string;
			HTTP_TIMEOUT: string;
			SWAGGER_DESCRIPTION: string;
			SWAGGER_VERSION: string;
			SWAGGER_CONTACT_EMAIL: string;
			SWAGGER_CONTACT_URL: string;
			SWAGGER_URL: string;
			GLOBAL_PREFIX: string;
			HTTP_TIMEOUT: string;
			HTTP_MAX_REDIRECT: string;
			LOG_LEVEL: string;
		}
	}
}

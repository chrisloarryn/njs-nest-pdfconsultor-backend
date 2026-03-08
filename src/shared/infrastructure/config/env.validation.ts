import Joi from 'joi';

export interface ValidatedEnv {
	DATABASE_DRIVER: 'pg-mem' | 'postgres';
	GLOBAL_PREFIX: string;
	LOG_LEVEL: string;
	NODE_ENV: 'development' | 'production' | 'qa' | 'test';
	PORT: number;
	POSTGRES_DB: string;
	POSTGRES_HOST: string;
	POSTGRES_LOGGING: boolean;
	POSTGRES_PASS: string;
	POSTGRES_PORT: number;
	POSTGRES_SYNCHRONIZE: boolean;
	POSTGRES_USER: string;
	SWAGGER_CONTACT_EMAIL: string;
	SWAGGER_CONTACT_NAME: string;
	SWAGGER_DESCRIPTION: string;
	SWAGGER_NAME: string;
	SWAGGER_URL: string;
	SWAGGER_VERSION: string;
}

export function validateEnv(config: Record<string, unknown>): ValidatedEnv {
	const schema = Joi.object<ValidatedEnv>({
		DATABASE_DRIVER: Joi.string().valid('pg-mem', 'postgres').default('postgres'),
		GLOBAL_PREFIX: Joi.string().default('cartolab'),
		LOG_LEVEL: Joi.string().default('info'),
		NODE_ENV: Joi.string().valid('development', 'production', 'qa', 'test').default('development'),
		PORT: Joi.number().required(),
		POSTGRES_DB: Joi.string().required(),
		POSTGRES_HOST: Joi.string().required(),
		POSTGRES_LOGGING: Joi.boolean().truthy('true').falsy('false').default(false),
		POSTGRES_PASS: Joi.string().required(),
		POSTGRES_PORT: Joi.number().required(),
		POSTGRES_SYNCHRONIZE: Joi.boolean().truthy('true').falsy('false').default(false),
		POSTGRES_USER: Joi.string().required(),
		SWAGGER_CONTACT_EMAIL: Joi.string().email({ tlds: false }).default('arquitectura@example.com'),
		SWAGGER_CONTACT_NAME: Joi.string().default('Arquitectura'),
		SWAGGER_DESCRIPTION: Joi.string().default('API para consulta de cartolas PDF'),
		SWAGGER_NAME: Joi.string().default('PDF Consultor API'),
		SWAGGER_URL: Joi.string().default('api-docs'),
		SWAGGER_VERSION: Joi.string().default('1.0.0'),
	}).unknown(true);

	const validationResult = schema.validate(config, {
		abortEarly: false,
		convert: true,
	});
	const error = validationResult.error;
	const value = validationResult.value as ValidatedEnv;

	if (error) {
		throw new Error(`Config validation error: ${error.message}`);
	}

	return value;
}

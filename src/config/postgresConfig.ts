import Joi from '@hapi/joi';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export class PostgresConfig implements TypeOrmOptionsFactory {
	postgresConfig: TypeOrmModuleOptions;

	constructor(options: TypeOrmModuleOptions) {
		this.postgresConfig = options;
	}
	createTypeOrmOptions(connectionName?: string | undefined): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
		return {
			name: connectionName,
			...this.postgresConfig,
		};
	}

	validate() {
		const envConfig = this.validateInput(this.postgresConfig);
		const postgresConfig: TypeOrmModuleOptions = envConfig;

		return postgresConfig;
	}

	private validateInput(envConfig: TypeOrmModuleOptions): TypeOrmModuleOptions {
		const envVarsSchema: Joi.ObjectSchema<TypeOrmModuleOptions> = Joi.object({
			type: Joi.string().valid('postgres').default('postgres'),
			host: Joi.string().required(),
			port: Joi.number().required(),
			username: Joi.string().required(),
			password: Joi.string().required(),
			database: Joi.string().required(),
			synchronize: Joi.boolean().default(false),
			logging: Joi.boolean().default(false),
			entities: Joi.array().items(Joi.string()).default([]),
			migrations: Joi.array().items(Joi.string()).default([]),
			subscribers: Joi.array().items(Joi.string()).default([]),
		})
			.unknown(true)
			.optional();

		const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);
		if (error) {
			throw new Error(`Config validation error: ${error.message}`);
		}
		return validatedEnvConfig;
	}
}

export default interface IEnvConfigInterface {
	[key: string]: string;
}

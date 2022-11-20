import { InternalServerErrorException } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import Joi from 'joi';

import { ErrorConfigIsNotDefined } from '@ccla/api/common/constants/errorConstants';

export class PostgresConfig implements TypeOrmOptionsFactory {
	postgresConfig: TypeOrmModuleOptions | undefined;

	constructor(options?: TypeOrmModuleOptions) {
		if (!options) throw new InternalServerErrorException(ErrorConfigIsNotDefined);
		this.postgresConfig = options;
	}
	createTypeOrmOptions(connectionName?: string | undefined): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
		return {
			name: connectionName,
			...this.postgresConfig,
		};
	}

	validate() {
		if (!this.postgresConfig) {
			throw new InternalServerErrorException(ErrorConfigIsNotDefined);
		}
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
			synchronize: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')),
			logging: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')),
			autoLoadEntities: Joi.boolean().default(true),
			entities: Joi.array().items(Joi.string()).default([]),
			migrations: Joi.array().items(Joi.string()).default([]),
			subscribers: Joi.array().items(Joi.string()).default([]),
			schema: Joi.string().default('public'),
		}).optional();

		const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);
		if (error) {
			throw new InternalServerErrorException(`Config validation error: ${error.message}`);
		}
		return validatedEnvConfig;
	}
}

export default interface IEnvConfigInterface {
	[key: string]: string;
}

import Joi from '@hapi/joi';

export class HttpConfig {
	private readonly options;
	private readonly envConfig: IEnvConfigInterface;

	constructor() {
		this.envConfig = this.validateInput(process.env);
		this.options = {
			timeout: parseInt(process.env['HTTP_TIMEOUT']),
			maxRedirects: parseInt(process.env['HTTP_MAX_REDIRECT']),
		};
	}

	public getOptions() {
		return this.options;
	}

	private validateInput(envConfig: NodeJS.ProcessEnv): IEnvConfigInterface {
		const envVarsSchema: Joi.ObjectSchema = Joi.object({
			NODE_ENV: Joi.string().valid('development', 'qa', 'test').default('development'),
			PORT: Joi.number().required(),
		}).unknown(true);

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

import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

import { HttpExceptionFilter } from '@/shared/presentation/filters/http-exception.filter';

export interface ApplicationRuntimeConfig {
	globalPrefix: string;
	logger: Logger;
	nodeEnv: string;
	port: number;
	swaggerUrl: string;
}

export function configureApplication(app: INestApplication): ApplicationRuntimeConfig {
	const configService = app.get(ConfigService);
	const logger = app.get<Logger>(WINSTON_MODULE_NEST_PROVIDER);
	const runtimeConfig: ApplicationRuntimeConfig = {
		globalPrefix: configService.get<string>('app.globalPrefix', 'cartolab'),
		logger,
		nodeEnv: configService.get<string>('app.nodeEnv', 'development'),
		port: configService.get<number>('app.port', 3000),
		swaggerUrl: configService.get<string>('app.swagger.url', 'api-docs'),
	};

	app.useLogger(logger);
	app.useGlobalFilters(new HttpExceptionFilter(logger));
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidUnknownValues: false,
		}),
	);
	app.setGlobalPrefix(runtimeConfig.globalPrefix);

	return runtimeConfig;
}

export function createSwaggerDocument(app: INestApplication, configService = app.get(ConfigService)): OpenAPIObject {
	const swaggerConfig = new DocumentBuilder()
		.setTitle(configService.get<string>('app.swagger.name', 'PDF Consultor API'))
		.setDescription(configService.get<string>('app.swagger.description', 'API para consulta de cartolas PDF'))
		.setVersion(configService.get<string>('app.swagger.version', '1.0.0'))
		.setContact(
			configService.get<string>('app.swagger.contactName', 'Arquitectura'),
			'',
			configService.get<string>('app.swagger.contactEmail', 'arquitectura@example.com'),
		)
		.build();

	return SwaggerModule.createDocument(app, swaggerConfig, {
		ignoreGlobalPrefix: false,
	});
}

export function setupSwagger(app: INestApplication, runtimeConfig: ApplicationRuntimeConfig, document?: OpenAPIObject): void {
	SwaggerModule.setup(`${runtimeConfig.globalPrefix}/${runtimeConfig.swaggerUrl}`, app, document ?? createSwaggerDocument(app));
}

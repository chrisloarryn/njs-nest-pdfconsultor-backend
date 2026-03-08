import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/shared/presentation/filters/http-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const configService = app.get(ConfigService);
	const logger = app.get<Logger>(WINSTON_MODULE_NEST_PROVIDER);
	const globalPrefix = configService.get<string>('app.globalPrefix', 'cartolab');
	const swaggerUrl = configService.get<string>('app.swagger.url', 'api-docs');
	const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
	const port = configService.get<number>('app.port', 3000);

	app.useLogger(logger);
	app.useGlobalFilters(new HttpExceptionFilter(logger));
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidUnknownValues: false,
		}),
	);
	app.setGlobalPrefix(globalPrefix);

	if (nodeEnv !== 'production') {
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

		const document = SwaggerModule.createDocument(app, swaggerConfig);
		SwaggerModule.setup(`${globalPrefix}/${swaggerUrl}`, app, document);
	}

	await app.listen(port);
}

void bootstrap();

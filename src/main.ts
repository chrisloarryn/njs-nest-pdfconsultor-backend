import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/app.module';
import { configureApplication, createSwaggerDocument, setupSwagger } from '@/shared/presentation/bootstrap/application.setup';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const configService = app.get(ConfigService);
	const runtimeConfig = configureApplication(app);

	if (runtimeConfig.nodeEnv !== 'production') {
		const document = createSwaggerDocument(app, configService);
		setupSwagger(app, runtimeConfig, document);
	}

	await app.listen(runtimeConfig.port);
}

void bootstrap();

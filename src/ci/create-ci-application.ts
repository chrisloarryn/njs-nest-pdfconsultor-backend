import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import type { DataSource } from 'typeorm';

import { applyCiEnvironment } from '@/ci/apply-ci-environment';
import { seedBankStatements } from '@/ci/bank-statements.seed';
import { PDF_BASE64_PORT } from '@/modules/bank-statements/domain/ports/pdf-base64.port';
import { type ApplicationRuntimeConfig, configureApplication } from '@/shared/presentation/bootstrap/application.setup';

export interface CiApplicationContext {
	app: INestApplication;
	dataSource: DataSource;
	runtimeConfig: ApplicationRuntimeConfig;
}

export async function createCiApplication({ seed = true }: { seed?: boolean } = {}): Promise<CiApplicationContext> {
	applyCiEnvironment();
	const { AppModule } = await import('@/app.module');

	const moduleRef = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideProvider(PDF_BASE64_PORT)
		.useValue({
			convert: () => of('ZmFrZS1wZGY='),
		})
		.compile();

	const app = moduleRef.createNestApplication();
	const runtimeConfig = configureApplication(app);
	await app.init();

	const dataSource = app.get<DataSource>(getDataSourceToken());
	if (seed) {
		await seedBankStatements(dataSource);
	}

	return {
		app,
		dataSource,
		runtimeConfig,
	};
}

import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { of } from 'rxjs';
import request from 'supertest';
import { type DataSource } from 'typeorm';

import { AppModule } from '@/app.module';
import { PDF_BASE64_PORT } from '@/modules/bank-statements/domain/ports/pdf-base64.port';
import { BankStatementOrmEntity } from '@/modules/bank-statements/infrastructure/persistence/entities/bank-statement.orm-entity';
import { HttpExceptionFilter } from '@/shared/presentation/filters/http-exception.filter';

describe('App e2e', () => {
	let app: INestApplication;
	let dataSource: DataSource;

	const pdfBase64Port = {
		convert: jest.fn(),
	};

	beforeEach(async () => {
		pdfBase64Port.convert.mockReset();
		pdfBase64Port.convert.mockReturnValue(of('ZmFrZS1wZGY='));

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(PDF_BASE64_PORT)
			.useValue(pdfBase64Port)
			.compile();

		app = moduleRef.createNestApplication();
		app.setGlobalPrefix(process.env.GLOBAL_PREFIX ?? 'cartolab');
		app.useGlobalPipes(
			new ValidationPipe({
				forbidUnknownValues: false,
				transform: true,
				whitelist: true,
			}),
		);
		app.useGlobalFilters(new HttpExceptionFilter(moduleRef.get(WINSTON_MODULE_NEST_PROVIDER)));
		await app.init();

		dataSource = app.get<DataSource>(getDataSourceToken());
		await seedDatabase(dataSource);
	});

	afterEach(async () => {
		if (app) {
			await app.close();
		}
	});

	it('GET /health responds 200', async () => {
		await request(app.getHttpServer()).get('/cartolab/health').expect(200);
	});

	it('GET /bank-statements/pdf returns a match by period and folio', async () => {
		const response = await request(app.getHttpServer())
			.get('/cartolab/bank-statements/pdf')
			.set('X-Period', '202401')
			.set('X-Folio', 'FOLIO-001')
			.expect(200);

		expect(response.body).toEqual([
			expect.objectContaining({
				car_folio: 'FOLIO-001',
				car_periodo: '202401',
				car_rut: 18979569,
				car_url: 'https://example.com/cartola-1.pdf',
			}),
		]);
	});

	it('GET /bank-statements/pdf?b64=true returns base64 content', async () => {
		const response = await request(app.getHttpServer()).get('/cartolab/bank-statements/pdf?b64=true').set('X-Rut', '18.979.569-6').expect(200);

		expect(response.body[0]).toEqual(
			expect.objectContaining({
				base64: 'ZmFrZS1wZGY=',
				car_rut: 18979569,
			}),
		);
	});

	it('GET /bank-statements/pdf returns 400 for invalid combinations', async () => {
		const response = await request(app.getHttpServer()).get('/cartolab/bank-statements/pdf').set('X-Period', '202401').expect(400);

		expect(response.body.message).toBe('rut or folio is required [BS]');
	});
});

async function seedDatabase(dataSource: DataSource): Promise<void> {
	const repository = dataSource.getRepository(BankStatementOrmEntity);

	await repository.clear();
	await repository.save([
		repository.create({
			car_folio: 'FOLIO-001',
			car_name: 'Cartola Enero',
			car_periodo: '202401',
			car_rut: 18979569,
			car_url: 'https://example.com/cartola-1.pdf',
			prc_id: 1,
			prd_id: 'PROD-1',
		}),
		repository.create({
			car_folio: 'FOLIO-002',
			car_name: 'Cartola Febrero',
			car_periodo: '202402',
			car_rut: 18979569,
			car_url: 'https://example.com/cartola-2.pdf',
			prc_id: 2,
			prd_id: 'PROD-2',
		}),
	]);
}

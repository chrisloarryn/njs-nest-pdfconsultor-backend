import request from 'supertest';

import type { CiApplicationContext } from '@/ci/create-ci-application';
import { createCiApplication } from '@/ci/create-ci-application';

describe('App e2e', () => {
	let context: CiApplicationContext;

	beforeEach(async () => {
		context = await createCiApplication();
	});

	afterEach(async () => {
		if (context?.app) {
			await context.app.close();
		}
	});

	it('GET /health responds 200', async () => {
		await request(context.app.getHttpServer()).get('/cartolab/health').expect(200);
	});

	it('GET /bank-statements/pdf returns a match by period and folio', async () => {
		const response = await request(context.app.getHttpServer())
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
		const response = await request(context.app.getHttpServer())
			.get('/cartolab/bank-statements/pdf?b64=true')
			.set('X-Rut', '18.979.569-6')
			.expect(200);

		expect(response.body[0]).toEqual(
			expect.objectContaining({
				base64: 'ZmFrZS1wZGY=',
				car_rut: 18979569,
			}),
		);
	});

	it('GET /bank-statements/pdf returns 400 for invalid combinations', async () => {
		const response = await request(context.app.getHttpServer()).get('/cartolab/bank-statements/pdf').set('X-Period', '202401').expect(400);

		expect(response.body.message).toBe('rut or folio is required [BS]');
	});
});

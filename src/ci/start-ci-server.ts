import { createCiApplication } from '@/ci/create-ci-application';
import { createSwaggerDocument, setupSwagger } from '@/shared/presentation/bootstrap/application.setup';

async function main() {
	const { app, runtimeConfig } = await createCiApplication();
	const document = createSwaggerDocument(app);

	setupSwagger(app, runtimeConfig, document);
	await app.listen(runtimeConfig.port);

	console.log(`CI server listening at http://127.0.0.1:${runtimeConfig.port}/${runtimeConfig.globalPrefix}`);
}

main().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});

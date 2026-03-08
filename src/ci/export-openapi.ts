import fs from 'node:fs/promises';
import path from 'node:path';

import { createCiApplication } from '@/ci/create-ci-application';
import { createSwaggerDocument } from '@/shared/presentation/bootstrap/application.setup';

async function main() {
	const outputPath = resolveOutputPath();
	const { app } = await createCiApplication({ seed: false });

	try {
		const document = createSwaggerDocument(app);
		const normalizedDocument = sortValue(document);

		await fs.mkdir(path.dirname(outputPath), { recursive: true });
		await fs.writeFile(outputPath, `${JSON.stringify(normalizedDocument, null, 2)}\n`, 'utf8');
		console.log(`OpenAPI document exported to ${outputPath}`);
	} finally {
		await app.close();
	}
}

function resolveOutputPath(): string {
	const outputFlagIndex = process.argv.findIndex((argument) => argument === '--output');
	if (outputFlagIndex >= 0 && process.argv[outputFlagIndex + 1]) {
		return path.resolve(process.cwd(), process.argv[outputFlagIndex + 1]);
	}

	if (process.env.OPENAPI_OUTPUT) {
		return path.resolve(process.cwd(), process.env.OPENAPI_OUTPUT);
	}

	return path.resolve(process.cwd(), 'artifacts', 'contract', 'openapi.json');
}

function sortValue(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map((item) => sortValue(item));
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([key, nestedValue]) => [key, sortValue(nestedValue)]),
		);
	}

	return value;
}

main().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});

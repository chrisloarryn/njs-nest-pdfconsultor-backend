import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./setupFile.ts'],
		include: ['src/**/*.spec.ts'],
		exclude: ['node_modules/**', 'dist/**', 'coverage/**', 'src/api/**', 'src/config/**'],
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'text-summary', 'json', 'html', 'json-summary', 'cobertura', 'lcov'],
			exclude: [
				'src/**/*.spec.ts',
				'src/**/*.orm-entity.ts',
				'src/main.ts',
				'src/app.module.ts',
				'src/shared/testing/**',
				'src/shared/infrastructure/config/**',
				'src/api/**',
				'src/config/**',
			],
		},
	},
});

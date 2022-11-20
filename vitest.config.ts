/// <reference types="vitest" />
// import AutoImport from 'unplugin-auto-import/vite';
import tsPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsPaths()],
	test: {
		include: ['src/**/*.spec.ts', './test/helpers/*.spec.ts'],
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/coverage/**',
			'**/src/api/modules/product/entities/product.entity.ts',
			'**/.{idea,git,cache,output,temp}/**',
			'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*',
			'./src/api/modules/product/entities/product.entity.ts',
			'./src/api/modules/process/entities/process.entity.ts',
			'./src/api/modules/bank-statement/entities/bank-statement.entity.ts',
			'./src/config/http.config.ts',
			'**/src/api/common/utils/validador-rut.ts',
			'./src/config/loggerConfig.ts',
		],
		alias: {
			'@ccla': 'src',
			'@cclatest': 'test',
		},
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'text-summary', 'json', 'html', 'json-summary', 'json', 'text-summary', 'cobertura'],
			watermarks: {
				statements: [50, 80],
				branches: [50, 80],
				functions: [50, 80],
				lines: [50, 80],
			},
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,

			// clean: true,
			exclude: [
				'**/node_modules/**',
				'**/dist/**',
				'**/coverage/**',
				'**/src/api/modules/product/entities/product.entity.ts',
				'**/src/api/modules/process/entities/process.entity.ts',
				'**/src/api/modules/bank-statement/entities/bank-statement.entity.ts',
				'**/src/config/http.config.ts',
				'**/src/config/loggerConfig.ts',
				'**/src/api/common/utils/validador-rut.ts',
				'**/.{idea,git,cache,output,temp}/**',
				'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*',
			],
		},
		globals: true,

		/* plugins: [
			AutoImport({
				imports: ['vitest'],
				dts: true,
			}),
		], */
		environment: 'node',
		setupFiles: ['./setupFile.ts'],
	},
});

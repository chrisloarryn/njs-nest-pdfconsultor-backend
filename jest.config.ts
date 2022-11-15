import type { Config } from 'jest';

export default async (): Promise<Config> => {
	process.env.NODE_ENV = 'test';
	return {
		verbose: true,
		testEnvironment: 'node',
		rootDir: './',
		transform: {
			'^.+\\.(t|j)s$': 'ts-jest',
		},
		// testRegex: '(/src/.*|(\\.|/)(test|spec))\\.(js?|ts?)$',
		moduleFileExtensions: ['ts', 'js', 'json', 'html'],
		coverageDirectory: './coverage/',
		testTimeout: 30000,
		testRegex: [
			'.*\\.spec\\.ts$',
			/* '(/src/.*|(\\.|/)(test|spec))\\.(js?|ts?)$' */
		],
		collectCoverage: true,
		// collectCoverageFrom: ['**/*.(t|j)s', '**/**.(t|j)s'],
		coveragePathIgnorePatterns: [
			// ignore all from: 'node_modules', 'src/app.module.ts', 'src/main.ts', 'src/declaration.d.ts' and all 'index.ts' on each nested folder.
			'/node_modules',
			'./src/app.module.ts',
			'./src/api/types',
			// ignore all dto files
			'./src/api/dto',
			'./src/api/enum',
			'./src/api/interface',
			// ignore './src/api/process/dto', './src/api/product/dto' and './src/api/bank-statement/dto'
			'./src/api/process/dto',
			'./src/api/product/dto',
			'./src/api/bank-statement/dto',
			'./src/api/controller/index.ts',
			'./src/api/service/index.ts',
			'./src/api/repository/index.ts',
			'./src/api/entities/index.ts',
			'./src/config/index.ts',
			'./src/api/common/utils/b64.utils.ts',
			'./src/api/common/utils/delay.utils.ts',
			'./src/api/common/utils/dotenv-options.ts',
			'./src/api/common/utils/error-options.ts',
			'./src/api/common/utils/health.controller.ts',
			'./src/api/common/utils/index.ts',
			'./src/api/common/utils/logs-options.ts',
			'./src/api/common/utils/validador-rut.ts',
			'./src/api/common/utils/validation-options.ts',
			'./src/api/core/response/error.response.ts',
			'./src/api/core/response/index.ts',
			'./src/api/core/response/log-error-object.response.ts',
			'./src/api/core/response/log-info-object.response.ts',
			'./src/api/common/types/common.type.ts',

			'./src/api/modules/bank-statement/entities/bank-statement.entity.ts',
			'./src/api/modules/bank-statement/entities/b64.bank-statement.entity.ts',
			'./src/api/modules/bank-statement/entities/index.ts',
			'./src/api/modules/process/entities/process.entity.ts',
			/* Ignoring the coverage of the product folder. */
			'./src/api/modules/product/entities/product.entity.ts',
			'./src/api/modules/product/enum/approval.enum.ts',
			'./src/api/modules/product/enum/index.ts',
		],
		testResultsProcessor: 'jest-sonar-reporter',
		notify: true,
		notifyMode: 'failure-change',
		coverageThreshold: {
			global: {
				branches: 30,
				functions: 30,
				lines: 30,
				statements: 30,
			},
		},
		moduleDirectories: ['<rootDir>/src', 'node_modules'],
		moduleNameMapper: {
			// mapper for "@ccla" alias
			'^@ccla/(.*)$': '<rootDir>/src/$1',
			'^@cclatest/(.*)$': '<rootDir>/test/$1',
		},
	};
};

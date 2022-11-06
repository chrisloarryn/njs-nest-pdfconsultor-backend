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
		coverageDirectory: '../coverage',
		testTimeout: 30000,
		testRegex: [
			'.*\\.spec\\.ts$',
			/* '(/src/.*|(\\.|/)(test|spec))\\.(js?|ts?)$' */
		],
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
			// './src/api/bank-statement',
			// './src/api/process',
			// './src/api/product',
		],
		testResultsProcessor: 'jest-sonar-reporter',
		notify: true,
		notifyMode: 'failure-change',
		coverageThreshold: {
			global: {
				branches: 20,
				functions: 20,
				lines: 20,
				statements: 20,
			},
		},
		moduleDirectories: ['<rootDir>/src', 'node_modules'],
		moduleNameMapper: {
			// mapper for "@ccla" alias
			'^@ccla/(.*)$': '<rootDir>/src/$1',
		},
	};
};

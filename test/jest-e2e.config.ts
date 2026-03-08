import type { Config } from 'jest';

const config: Config = {
	rootDir: '..',
	moduleFileExtensions: ['js', 'json', 'ts'],
	testEnvironment: 'node',
	testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.jest.json',
			},
		],
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	setupFiles: ['<rootDir>/test/setup-e2e.ts'],
	testTimeout: 30000,
};

export default config;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const scanner = require('sonarqube-scanner');

const exclusions = [
	'**/*.spec.ts',
	'src/config/**',
	'src/api/common/types/**',
	'src/api/core/**',
	'src/main.ts',
	'src/app.module.ts',
	'src/api/modules/product/entities/product.entity.ts',
	'src/api/modules/product/product.module.ts',
	'src/api/modules/process/entities/process.entity.ts',
	'src/api/modules/bank-statement/entities/bank-statement.entity.ts',
	'src/config/http.config.ts',
	'src/config/loggerConfig.ts',
	'src/api/common/utils/validador-rut.ts',
	'**/.{idea,git,cache,output,temp}/**',
	'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*',

	// TODO: test utils soon and e2e tests
	'src/api/common/utils/**',
];
scanner(
	{
		serverUrl: 'http://localhost:9000',
		login: 'admin',
		password: 'admin',
		token: 'sqp_46479ab33492a9395676b1be19f49251b3735689',
		options: {
			'sonar.sources': './src',
			'sonar.projectVersion': '1.0.0',
			'sonar.language': 'ts',
			'sonar.sourceEncoding': 'UTF-8',
			'sonar.exclusions': exclusions.join(','),
			'sonar.test.exclusions': exclusions.join(','),
			'sonar.test.inclusions': '**/*.test.ts,**/*.test.ts',
			'sonar.typescript.lcov.reportPaths': './coverage/lcov.info',
			'sonar.testExecutionReportPaths': './test-results.xml',
			'sonar.genericcoverage.testExecutionReportPaths': './test-results.xml',
			'sonar.projectKey': 'njs-nest-pdfconsultor-backend',
			'sonar.eslint.reportPaths': 'eslint-report.json',
		},
	},
	() => process.exit(),
);

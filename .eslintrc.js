module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin', '@typescript-eslint', 'prettier', 'import'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',

		// Extends two more configuration from "import" plugin
		'plugin:import/recommended',
		'plugin:import/typescript',
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.js', 'package.json', 'package-lock.json'],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',

		// allow semi-colons
		'prettier/prettier': [
			'error',
			{
				singleQuote: true,
				trailingComma: 'all',
				printWidth: 150,
				tabWidth: 2,
				semi: true,
				bracketSpacing: true,
				arrowParens: 'always',
				endOfLine: 'auto',
				useTabs: true,
				overrides: [
					{
						files: '*.md',
						options: {
							tabWidth: 2,
						},
					},
					{
						files: '*.json',
						options: {
							tabWidth: 2,
						},
					},
					{
						files: '*.yml',
						options: {
							tabWidth: 2,
						},
					},
				],
				importOrder: ['<THIRD_PARTY_MODULES>', '@/(.*)', '^[./]'],
				importOrderSeparation: true,
			},
		],
		// turn on errors for missing imports
		'import/no-unresolved': [
			'error',
			{
				ignore: ['rambda', 'lodash'],
			},
		],
		// 'import/no-named-as-default-member': 'off',
		'import/order': [
			'error',
			{
				groups: [
					'builtin', // Built-in imports (come from NodeJS native) go first
					'external', // <- External imports
					'internal', // <- Absolute imports
					['sibling', 'parent'], // <- Relative imports, the sibling and parent types they can be mingled together
					'index', // <- index imports
					'unknown', // <- unknown
				],
				'newlines-between': 'always',
				alphabetize: {
					/* sort in ascending order. Options: ["ignore", "asc", "desc"] */
					order: 'asc',
					/* ignore case. Options: [true, false] */
					caseInsensitive: true,
				},
			},
		],
		// 'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
		// '@typescript-eslint/no-unused-vars': 'off',
		// 'unused-imports/no-unused-imports': 'error',
		// 'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
	},
	settings: {
		'import/resolver': {
			typescript: {
				project: './tsconfig.json',
				alwaysTryTypes: true,
			},
			node: {
				extensions: ['.js', '.ts', '.d.ts'],
				caseInsensitive: true,
			},
		},
	},
};

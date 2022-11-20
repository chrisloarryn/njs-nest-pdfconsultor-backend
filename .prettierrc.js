module.exports = {
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
	// delete unused imports
	noUnusedLocals: true,
	noUnusedImports: true,
};

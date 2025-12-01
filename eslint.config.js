// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';

// Define the base TS config array once
const tsRecommended = tseslint.configs.recommendedTypeChecked.map((config) => ({
	...config,
	languageOptions: {
		...config.languageOptions,
		parserOptions: {
			tsconfigRootDir: import.meta.dirname,
		},
	},
}));


export default [
	{
		ignores: [
			'dist',
			'build',
			'node_modules',
			'eslint.config.js',
			'vite.config.js',
			'vite.config.ts'
		],
	},
	js.configs.recommended,
	{
		plugins: {
			react: pluginReact,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	...tsRecommended.map((config) => ({
		...config,
		files: ['src/**/*.{ts,tsx}'],
		languageOptions: {
				...config.languageOptions,
				parserOptions: {
						...config.languageOptions.parserOptions,
						project: ['./tsconfig.json'], // Point to the app's TS config
				},
				globals: {
						...globals.browser,
						...globals.node,
				},
		},
		rules: {
			'react/react-in-jsx-scope': 'off',
		},
	})),
	{
		files: ["*.d.ts"],
		rules: {
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/triple-slash-reference": "off"
		}
	},
];

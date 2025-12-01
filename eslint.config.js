// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper for __dirname in ESM format
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // 1. Global Ignores: Prevent linting of output and config files
  {
    ignores: [
      'dist', 
      'build', 
      'node_modules', 
      'eslint.config.js', 
      '**/*.d.ts' // Ignore declaration files
    ],
  },

  // 2. Base Recommended JavaScript and React configurations
  js.configs.recommended,
  {
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },
    },
  },
  
  // 3. Type-Aware Configuration for Application Source Files (src)
  // This uses tsconfig.app.json for type information
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        project: ['./tsconfig.app.json'], // Use the app-specific config
        tsconfigRootDir: __dirname, // Required for correct path resolution
      },
    },
    rules: {
      // Disable base rule, use TS one
      'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true }
      ],
      'no-unused-vars': 'off', 
      '@typescript-eslint/no-unused-vars': 'error', 
      'react/react-in-jsx-scope': 'off',
      // Add other type-aware rules as needed
      // e.g., '@typescript-eslint/no-floating-promises': 'error',
    },
  })),
  
  // 4. Type-Aware Configuration for Node/Config Files (vite.config.ts, globals.ts)
  // This uses tsconfig.node.json for type information
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['vite.config.ts', 'globals.ts'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        project: ['./tsconfig.node.json'], // Use the node-specific config
        tsconfigRootDir: __dirname,
      },
    },
    // No specific rules needed here usually
  })),
	{
	  files: ['src/**/*.{ts,tsx}'],
	  // Use the imported object directly, not the map name
	  plugins: {
	    'react-refresh': pluginReactRefresh, 
	  },
	  rules: {
	    'react-refresh/only-export-components': [
	      'warn',
	      { allowConstantExport: true }
	    ],
	  },
	},
];

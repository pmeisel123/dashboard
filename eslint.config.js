// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';

export default [
  // 1. Recommended JS/TS Base Configs
  js.configs.recommended,
  
  // 2. Base configuration for React (settings and default rules)
  {
    plugins: {
      react: pluginReact,
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  },

  // 3. Configuration specific to your application's source files
  // This is where we apply the TypeScript parser and type-checking options
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser, // Explicitly use the TS parser
      parserOptions: {
        // Crucial options for TS/React
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Define global variables available in your browser/node environment
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Add specific React or MUI rules here
      'react/react-in-jsx-scope': 'off',
      // Example type-aware rule: '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  
  // 4. Handle Declaration Files (.d.ts) (Optional, useful for vite-env.d.ts error)
  {
    files: ["*.d.ts"],
    rules: {
      // Prevents "Parsing error: Unexpected token const" for simple ambient declarations
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/triple-slash-reference": "off"
    }
  },

  // 5. Ignore specific directories/files
  {
    ignores: ['dist', 'build', 'node_modules', '*.config.js'],
  },
];

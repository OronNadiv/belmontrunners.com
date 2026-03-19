import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: true,
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // Strict errors
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      'no-restricted-syntax': ['error', 'SequenceExpression'],
      '@typescript-eslint/no-namespace': 'error',
      'no-param-reassign': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      'no-labels': 'error',
      'no-cond-assign': 'error',
      'no-new-wrappers': 'error',
      'constructor-super': 'error',
      'no-duplicate-case': 'error',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-duplicate-imports': 'error',

      // Warnings
      '@typescript-eslint/no-empty-interface': 'warn',
      'no-var': 'warn',
      eqeqeq: 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      'prefer-const': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
      // react/display-name: broken in eslint-plugin-react v7 — uses legacy getFilename() API removed in ESLint 10
    }
  },
  {
    ignores: ['build/**', 'dist/**', 'node_modules/**', 'functions/**', 'public/js/**', 'public/vendors/**', 'original/**', 'eventure/**']
  }
]

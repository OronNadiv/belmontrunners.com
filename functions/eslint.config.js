const tseslint = require('@typescript-eslint/eslint-plugin')
const tsparser = require('@typescript-eslint/parser')

module.exports = [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // Strict errors
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      'no-restricted-syntax': ['error', 'SequenceExpression'],
      '@typescript-eslint/no-namespace': 'error',
      'no-param-reassign': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
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
      'prefer-const': 'warn'
    }
  },
  {
    ignores: ['lib/**', 'node_modules/**']
  }
]

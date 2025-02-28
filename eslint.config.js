// @ts-check

import eslint from '@eslint/js'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  {
    ignores: [
      'dist/js/*.js',
      'docs/**/*',
      'build/*.js',
      'jest-coverage',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  unicorn.configs.recommended,
  stylistic.configs.recommended,
  {
    languageOptions: {
      globals: {
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 2022,
      },
    },
    plugins: {
      '@unicorn': unicorn,
      '@stylistic': stylistic,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      // '@typescript-eslint/member-ordering': 'warn',
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        { overrides: { constructors: 'off' } },
      ],
      'newline-before-return': 'error',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/switch-case-braces': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-for-loop': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/no-static-only-class': 'off',
      'unicorn/prefer-dom-node-dataset': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/prefer-add-event-listener': 'off',
      'unicorn/no-negated-condition': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/space-before-function-paren': ['error', 'never'],
      '@stylistic/arrow-parens': 'off',
      '@stylistic/max-len': ['warn', { code: 100 }],
      '@stylistic/semi': ['error', 'never', { beforeStatementContinuationChars: 'always' }],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/operator-linebreak': ['error', 'before'],
      '@stylistic/indent': ['error', 2],
    },
  },
)

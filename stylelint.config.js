/* eslint-disable @stylistic/max-len */
/* eslint-disable unicorn/no-null */
export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-idiomatic-order',
  ],
  overrides: [
    {
      files: ['**/*.scss'],
      rules: {
        'at-rule-no-unknown': null,
        'scss/at-rule-no-unknown': [
          true,
          {
            ignoreAtRules: [
              'use',
              'extend',
            ],
          },
        ],
        'selector-class-pattern': [
          '(^([a-z][a-z0-9]*)(-[a-z0-9]+)*$)|(^([a-z][a-z0-9]*)(_[a-z0-9]+)*$)',
          {
            message: 'Expected class selector to be kebab-case or snake_case (vendor overrides only)',
          },
        ],
      },
    },
  ],
  ignoreFiles: [
    'dist/**',
    'node_modules/**',
    'jest-coverage/**',
  ],
}

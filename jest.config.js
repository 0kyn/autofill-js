/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: 'jsdom',
  transform: {
    // eslint-disable-next-line no-useless-escape
    '^.+\.tsx?$': ['ts-jest', {}],
  },
  testMatch: [
    '**/tests/unit/**/*.test.ts',
  ],
  collectCoverageFrom: [
    'src/js/**/*.ts',
    '!**/node_modules/**',
  ],

  coverageDirectory: 'jest-coverage/',

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },

  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],

  verbose: true,
}

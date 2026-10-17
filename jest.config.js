// SPDX-License-Identifier: GPL-3.0-or-later
/** Unit tests cover pure logic (program data, weight pre-fill, photo lookup). */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', target: 'es2020', strict: true, esModuleInterop: true, isolatedModules: true } }],
  },
  moduleNameMapper: {
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
  },
};

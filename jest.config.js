module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.{js,ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!lib/**/*.d.ts',
    'components/**/*.{js,jsx,ts,tsx}',
    '!components/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\.(js|jsx|ts|tsx)$': 'ts-jest'
  },
  testTimeout: 10000,
  verbose: true,
  collectCoverage: false,
  passWithNoTests: true
};
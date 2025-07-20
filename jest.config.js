export default {
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/tests/**/*.test.[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}; 
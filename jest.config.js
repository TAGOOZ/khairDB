export default {
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mjs'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/tests/**/*.test.[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library)/)'
  ],
}; 
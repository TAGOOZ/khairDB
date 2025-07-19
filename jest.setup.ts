// jest.setup.ts
// We're not using @testing-library/jest-dom directly in ESM context
// import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Set up global variables for tests
global.console = {
  ...console,
  // Uncomment to silence console logs in tests
  // log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Adding an export makes this file a proper ESM module
export {}; 
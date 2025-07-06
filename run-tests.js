// run-tests.js
import { execSync } from 'child_process';

console.log('Running all tests for Individual form and assistance details...');

try {
  // Run Jest with all our test files
  execSync('node --experimental-vm-modules node_modules/jest/bin/jest.js --config=jest.config.cjs', {
    stdio: 'inherit' // This will show the test output in the console
  });
  
  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.error('\n❌ Tests failed. See above for details.');
  process.exit(1);
} 
# Individual Form Testing

This repository includes tests for the Individual form functionality, particularly focused on testing the assistance details (medical, food, debt, etc.) without requiring Supabase MCP.

## Test Setup

The tests use Jest as the testing framework and mock the Supabase client to avoid making actual database calls.

## Available Tests

1. **Unit Tests for Individual Service**
   - Located at `src/services/__tests__/individuals.test.ts`
   - Tests the `createIndividual` function with various assistance details
   - Verifies correct formatting and data handling

2. **Component Tests for IndividualForm**
   - Located at `src/components/forms/__tests__/IndividualForm.test.tsx`
   - Tests the form rendering and user interactions
   - Verifies that assistance details are properly captured from the form

3. **End-to-End Test Scenario**
   - Located at `src/tests/e2e/addIndividualWithAssistance.test.ts`
   - Simulates the full flow of adding an individual with assistance details
   - Includes a test for potential schema mismatches

## Running the Tests

### Prerequisites

Make sure you have all the dependencies installed:

```bash
npm install
```

### Run All Tests

```bash
node run-tests.js
```

Or use the npm script:

```bash
npm test
```

### Run Specific Tests

To run only a specific test file:

```bash
npx jest src/services/__tests__/individuals.test.ts
```

## Test Details

### Schema Mismatch Handling

The tests specifically check how the application handles potential mismatches between:

1. The form fields in `IndividualForm.tsx` which collect data such as:
   ```
   debt_assistance: {
     debt_status: false,
     reason_for_debt: '',
     debt_amount: 0,
     official_debt_documents: null
   }
   ```

2. The schema definition in `individualSchema.ts` which expects:
   ```
   debt_assistance: {
     needs_debt_assistance: false,
     debt_amount: 0,
     household_appliances: false,
     hospital_bills: false,
     education_fees: false,
     business_debt: false,
     other_debt: false,
   }
   ```

The test verifies that even with this mismatch, the application handles it gracefully and properly transforms the data before database operations.

## Mocking Approach

The tests use Jest's mocking capabilities to replace the Supabase client with a mock implementation that:

1. Returns appropriate success responses for database operations
2. Allows us to verify that the correct data is being sent to the database
3. Simulates potential error conditions

This approach ensures we can fully test the application's logic without requiring an actual Supabase connection. 
# Code Review Issues

## Critical Issues

### 1. Missing Authentication in Delete Drive Folder
- **File**: `supabase/functions/delete-drive-folder/index.ts`
- **Location**: Entire function
- **Category**: SECURITY
- **Severity**: CRITICAL
- **Problem**: No authentication or authorization check before deleting Google Drive folders
- **Impact**: Anyone who knows a folderId can delete any folder without being authenticated or authorized
- **Fix**: Add user authentication and authorization check before allowing deletion

## High Severity Issues

### 2. Role Constraint Database Schema Bug
- **File**: `src/db/schemas/01_auth.sql`
- **Location**: Line 8
- **Category**: BUG
- **Severity**: HIGH
- **Problem**: Role check constraint only allows 'admin' value: `CHECK (role IN ('admin'))`
- **Impact**: Cannot create users with 'user' role, breaking the intended role-based system
- **Fix**: Change to `CHECK (role IN ('admin', 'user'))`

### 3. Weak Transaction Management in Delete Individual
- **File**: `src/services/individuals.ts`
- **Location**: Lines 652-656 and 755-758
- **Category**: BUG
- **Severity**: HIGH
- **Problem**: Manual transaction management with begin/commit/rollback RPC calls
- **Impact**: If these RPC functions don't exist or fail, transaction guarantees are lost, leading to data corruption
- **Fix**: Use database-level transactions through a single RPC function that wraps all operations

### 4. Proceed Without Transaction
- **File**: `src/services/pendingRequests.ts`
- **Location**: Line 203
- **Category**: BUG
- **Severity**: HIGH
- **Problem**: Proceeds without transaction if begin_transaction fails
- **Impact**: Data inconsistency if partial operations succeed before a failure occurs
- **Fix**: Throw error and stop if transaction cannot be started

### 5. Insecure CORS Configuration
- **File**: `supabase/functions/create-user-admin/index.ts`
- **Location**: Line 5
- **Category**: SECURITY
- **Severity**: HIGH
- **Problem**: CORS header allows all origins with wildcard '*'
- **Impact**: Allows any website to call this edge function, enabling cross-site request forgery and unauthorized access
- **Fix**: Replace '*' with specific allowed origins from environment variable

## Medium Severity Issues

### 6. Race Condition in Pending Requests
- **File**: `src/services/pendingRequests.ts`
- **Location**: Lines 18-23 and 171-176
- **Category**: BUG
- **Severity**: MEDIUM
- **Problem**: Race condition between ID existence check and insert operation
- **Impact**: Two concurrent requests could pass the check and both insert with the same ID number, creating duplicate records
- **Fix**: Use unique constraint on id_number in database and handle duplicate error, or use database transaction

### 7. Token Extraction Without Validation
- **File**: `supabase/functions/create-user-admin/index.ts`
- **Location**: Lines 39-40
- **Category**: BUG
- **Severity**: MEDIUM
- **Problem**: Token extraction assumes 'Bearer ' prefix without validation
- **Impact**: If Authorization header format differs, token extraction will fail or extract wrong value
- **Fix**: Check if header starts with 'Bearer ' before replacing

### 8. N+1 Query Pattern in Distributions
- **File**: `src/services/distributions.ts`
- **Location**: Lines 316-347
- **Category**: PERFORMANCE
- **Severity**: MEDIUM
- **Problem**: N+1 query pattern - fetching individual/child data for each recipient in separate queries
- **Impact**: With many recipients, causes excessive database queries and slow response times
- **Fix**: Use a single query with IN clause or JOIN to fetch all recipient details at once

### 9. Name Splitting Logic Bug
- **File**: `src/services/distributions.ts`
- **Location**: Lines 57-58
- **Category**: BUG
- **Severity**: MEDIUM
- **Problem**: Name splitting assumes single space separator and two-part names
- **Impact**: Will incorrectly split multi-word names like 'Mary Jane Smith' resulting in first_name='Mary', last_name='Jane' instead of 'Smith'
- **Fix**: Use lastIndexOf(' ') to split correctly: `const lastSpaceIndex = member.name?.lastIndexOf(' ')`

### 10. Role Parameter Not Validated
- **File**: `supabase/functions/create-user-admin/index.ts`
- **Location**: Line 66
- **Category**: SECURITY
- **Severity**: MEDIUM
- **Problem**: Role parameter is not validated against whitelist before use
- **Impact**: An attacker could pass arbitrary role values like 'superadmin' or bypass intended role restrictions
- **Fix**: Validate role is in ['admin', 'user'] before creating user

### 11. Hardcoded Example Credentials
- **File**: `src/config/auth.ts`
- **Location**: Lines 2-6
- **Category**: SECURITY
- **Severity**: MEDIUM
- **Problem**: Hardcoded example credentials with actual email and weak password
- **Impact**: If this code is deployed with example credentials enabled, provides a default backdoor into the system
- **Fix**: Remove hardcoded credentials or ensure they are only used in development with environment checks

## Low Severity Issues

### 12. Global Console Override
- **File**: `src/components/admin/StorageSetup.tsx`
- **Location**: Lines 24-35 and 62-73
- **Category**: MAINTAINABILITY
- **Severity**: LOW
- **Problem**: Overriding global console.log and console.error functions
- **Impact**: Modifies global state, affects all code running during the operation, and can cause race conditions in concurrent scenarios
- **Fix**: Use a dedicated logging function or array that doesn't modify global console

### 13. Type Any Usage
- **File**: `supabase/functions/update-user-admin/index.ts`
- **Location**: Line 88
- **Category**: MAINTAINABILITY
- **Severity**: LOW
- **Problem**: Use of 'any' type for updateData bypasses TypeScript type checking
- **Impact**: Reduces type safety and allows potentially invalid data to be inserted
- **Fix**: Define proper interface or type for updateData

## Summary

- **Critical**: 1
- **High**: 5
- **Medium**: 6
- **Low**: 2
- **Total**: 14 issues

## Priority Recommendations

1. **Immediate Action Required**: Fix the delete-drive-folder authentication issue (Critical)
2. **High Priority**: Fix role constraint schema bug and transaction management issues
3. **Medium Priority**: Address race conditions, N+1 queries, and security validation issues
4. **Low Priority**: Improve type safety and code maintainability

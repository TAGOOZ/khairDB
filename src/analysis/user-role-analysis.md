# User Role Analysis for Individuals Form Data Access

## Current System Analysis

### 1. Database Schema Analysis

#### Users Table (from src/db/schemas/01_users.sql)
- Users can have roles: 'admin' or 'user'
- RLS policies allow users to view their own profile and all other profiles
- Users can only update their own profile (with role restriction to prevent escalation)

#### Individuals Table (from src/db/schemas/02_individuals.sql)
- RLS Policies:
  - `"Users can view all individuals"` - ALL authenticated users can view all individuals
  - `"Users can create individuals"` - Users can create if admin OR if they are the creator
  - `"Users can update individuals they created"` - Users can update if admin OR if they created it
  - `"Only admins can delete individuals"` - Only admins can delete

### 2. Frontend Permission Analysis

#### Individual Form Access (src/pages/Individuals/index.tsx)
- Both admin and user roles can access the individuals page
- Form submission behavior differs:
  - **Admin**: Direct creation/update via `createIndividual()` and `updateIndividual()`
  - **User**: Submits for approval via `submitIndividualRequest()`

#### Data Retrieval (src/hooks/useIndividuals.ts)
- Uses the same query for both admin and user roles
- No role-based filtering in the data fetching logic
- All authenticated users can see all individuals data

### 3. Service Layer Analysis

#### Individual Creation (src/services/individuals.ts)
- `createIndividual()`: Creates individual directly in database
- No role-based restrictions in the service itself
- Relies on database RLS policies for access control

#### Pending Requests (src/services/pendingRequests.ts)
- `submitIndividualRequest()`: Creates pending request for approval
- Used when user role submits individual data

### 4. Current Issues Identified

#### ⚠️ SECURITY CONCERN: Data Access Parity
**User accounts currently have the SAME data access as admin accounts:**

1. **Full Read Access**: Users can view ALL individuals in the system
2. **Complete Form Data**: Users receive all individual details including:
   - Personal information
   - Contact details
   - Employment information
   - All assistance details
   - Family members and children
   - Distribution history
   - Created by information

#### ⚠️ POTENTIAL PRIVACY ISSUES:
- Users can see individuals created by other users
- Users can see individuals created by admins
- No data filtering based on creator or organizational hierarchy

### 5. Recommended Security Improvements

#### Option A: Restrict User Data Access (Recommended)
```sql
-- Update RLS policy to restrict user access to their own created individuals
DROP POLICY "Users can view all individuals" ON individuals;

CREATE POLICY "Users can view individuals based on role"
  ON individuals FOR SELECT
  TO authenticated
  USING (
    is_admin() OR 
    created_by = auth.uid()
  );
```

#### Option B: Implement Data Filtering in Frontend
- Add role-based filtering in `useIndividuals` hook
- Filter individuals based on `created_by` field for non-admin users

#### Option C: Create Separate Views for Different Roles
- Create database views with appropriate data filtering
- Use different queries based on user role

### 6. Current Form Submission Flow

#### Admin Users:
1. Fill form → Direct database insertion → Immediate availability
2. Full CRUD operations on all individuals

#### Regular Users:
1. Fill form → Pending request creation → Admin approval required
2. Can only edit their own pending requests
3. **BUT** can still view all approved individuals (security issue)

## Conclusion

**The current system has a significant security flaw**: User accounts can access and view the complete data of ALL individuals in the system, just like admin accounts. The only difference is in the submission process (direct vs. approval-based), but data access is identical.

This means user accounts deliver the same data from the individuals form as admin accounts, which may not be the intended behavior for a role-based system.
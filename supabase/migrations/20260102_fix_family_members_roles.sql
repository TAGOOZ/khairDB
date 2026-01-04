-- Migration: Fix Family Members Roles
-- Description: Set at least one family member as 'parent' for each family
--              where all members currently have 'other' role
-- Date: 2026-01-02

-- This migration identifies families where all members have 'other' role
-- and assigns the first member as 'parent' to satisfy database constraints

-- Step 1: Show affected families before update
-- Comment this out if you don't want the log
-- SELECT
--   f.id as family_id,
--   f.name as family_name,
--   COUNT(fm.id) as member_count
-- FROM families f
-- JOIN family_members fm ON fm.family_id = f.id
-- WHERE NOT EXISTS (
--   SELECT 1 FROM family_members
--   WHERE family_id = f.id AND role = 'parent'
-- )
-- GROUP BY f.id, f.name
-- ORDER BY f.name;

-- Step 2: Update first member of each family to 'parent' role
-- Using a CTE to identify first member per family and update them
WITH families_without_parents AS (
  SELECT
    fm.family_id,
    MIN(fm.id) as first_member_id
  FROM family_members fm
  WHERE fm.role = 'other'
    AND NOT EXISTS (
      -- Only target families that don't already have a parent
      SELECT 1
      FROM family_members fm2
      WHERE fm2.family_id = fm.family_id
        AND fm2.role = 'parent'
    )
  GROUP BY fm.family_id
)
UPDATE family_members fm
SET role = 'parent',
    updated_at = NOW()
WHERE fm.id IN (SELECT first_member_id FROM families_without_parents);

-- Step 3: Verification - Show updated members
-- Comment this out if you don't want the log
-- SELECT
--   f.name as family_name,
--   fm.id as member_id,
--   i.first_name,
--   i.last_name,
--   fm.role
-- FROM family_members fm
-- JOIN families f ON f.id = fm.family_id
-- JOIN individuals i ON i.id = fm.individual_id
-- WHERE fm.id IN (SELECT first_member_id FROM families_without_parents)
-- ORDER BY f.name;

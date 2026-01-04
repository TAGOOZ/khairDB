-- Migration: Fix Individuals Family Foreign Key
-- Description: Adds the missing foreign key constraint for individuals.family_id
-- Date: 2026-01-05

ALTER TABLE individuals 
ADD CONSTRAINT individuals_family_id_fkey 
FOREIGN KEY (family_id) REFERENCES families(id) 
ON DELETE SET NULL;

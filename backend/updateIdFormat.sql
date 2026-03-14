-- Update applications table to support new ID format
ALTER TABLE applications ALTER COLUMN id TYPE VARCHAR(30);

-- Also update application_number column to be consistent
ALTER TABLE applications ALTER COLUMN application_number TYPE VARCHAR(30);

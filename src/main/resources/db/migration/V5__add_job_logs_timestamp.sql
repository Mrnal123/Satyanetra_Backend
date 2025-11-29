-- Add timestamp column if it doesn't exist
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP;

-- Add job_id column if it doesn't exist
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS job_id VARCHAR(255);

-- Increase message column size to match entity definition
ALTER TABLE job_logs ALTER COLUMN message TYPE VARCHAR(1024);

-- Remove columns that don't exist in entity (only if they exist)
ALTER TABLE job_logs DROP COLUMN IF EXISTS created_at;
ALTER TABLE job_logs DROP COLUMN IF EXISTS product_id;
ALTER TABLE job_logs DROP COLUMN IF EXISTS status;
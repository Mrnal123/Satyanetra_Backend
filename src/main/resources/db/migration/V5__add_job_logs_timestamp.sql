-- Add missing timestamp column
ALTER TABLE job_logs ADD COLUMN timestamp TIMESTAMP;

-- Add missing job_id column  
ALTER TABLE job_logs ADD COLUMN job_id VARCHAR(255);

-- Increase message column size to match entity definition
ALTER TABLE job_logs ALTER COLUMN message TYPE VARCHAR(1024);

-- Remove columns that don't exist in entity
ALTER TABLE job_logs DROP COLUMN created_at;
ALTER TABLE job_logs DROP COLUMN product_id;
ALTER TABLE job_logs DROP COLUMN status;
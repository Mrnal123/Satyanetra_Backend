-- Increase the size of the message column in job_logs table to accommodate longer error messages
ALTER TABLE job_logs ALTER COLUMN message TYPE VARCHAR(2000);
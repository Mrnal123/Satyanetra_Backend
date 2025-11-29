-- Ensure job_logs has a timestamp column and create index safely
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_job_logs_timestamp ON job_logs(timestamp);

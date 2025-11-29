-- Align database schema with JPA entities for cross-DB compatibility (H2/Postgres)

-- PRODUCTS: ensure types and columns
ALTER TABLE products ALTER COLUMN id TYPE VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS url VARCHAR(2048);
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
-- Unique constraint on url (use index for cross-DB compatibility)
CREATE UNIQUE INDEX IF NOT EXISTS uk_products_url ON products(url);

-- JOBS: create if missing
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255),
    status VARCHAR(255),
    progress INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- SCORES: create if missing
CREATE TABLE IF NOT EXISTS scores (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255),
    overall_score INTEGER,
    review_analysis TEXT,
    image_verification TEXT,
    seller_credibility TEXT,
    product_details TEXT,
    created_at TIMESTAMP
);

-- JOB_LOGS: index to support ordering and lookup
CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
-- NOTE: timestamp column may not exist in early schemas; index creation moved to V7

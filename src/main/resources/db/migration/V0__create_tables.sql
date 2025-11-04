CREATE TABLE products (
    id BIGINT NOT NULL,
    name VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE job_logs (
    id UUID NOT NULL,
    created_at TIMESTAMP,
    message VARCHAR(255),
    product_id BIGINT,
    status VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

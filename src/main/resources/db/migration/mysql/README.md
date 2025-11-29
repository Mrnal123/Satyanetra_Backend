MySQL Flyway Migrations
=======================

Place MySQL-specific Flyway migration files in this directory.

Notes when porting from PostgreSQL:
- Use `BIGINT` or `INT` for numeric IDs; avoid `SERIAL` (not supported).
- For UUIDs, use `CHAR(36)` or `BINARY(16)` and handle generation in the app.
- Use `JSON` for JSON columns; avoid PostgreSQL-specific `JSONB` functions.
- Timestamps: prefer `DATETIME(6)` or `TIMESTAMP(6)`; avoid `WITH TIME ZONE`.
- Text: use `VARCHAR(…)` or `TEXT` with `utf8mb4` charset.
- Rename reserved words (e.g., `order`) or wrap in backticks.

Example file names:
- `V1__init_schema.sql`
- `V2__add_user_table.sql`

Flyway will run these in version order on app startup when the `mysql` profile is active.


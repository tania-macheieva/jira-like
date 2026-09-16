# Environment variables

The Rails API reads database connection settings from environment variables configured in the host environment.

## Required PostgreSQL variables

The app uses these keys in `api/config/database.yml`:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `RAILS_MAX_THREADS`

Example:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export RAILS_MAX_THREADS=5
```

You can also provide a full `DATABASE_URL` if you prefer a single connection string.

## Typical local workflow

```bash
cd /home/tania-macheieva/SS/jira-like/api
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
bin/rails db:create
bin/rails db:schema:load
bin/rails server
```

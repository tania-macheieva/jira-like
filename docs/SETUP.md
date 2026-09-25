# Local setup

## Requirements

- Ruby 3.4.x
- Bundler
- PostgreSQL server
- Docker (optional, for containerized workflows)

## Install backend dependencies

```bash
cd /home/tania-macheieva/SS/jira-like/api
bundle install
```

## Database setup

Create the PostgreSQL database and load the schema:

```bash
cd /home/tania-macheieva/SS/jira-like/api
bin/rails db:create
bin/rails db:schema:load
```

For a fresh local environment, you can also run:

```bash
bin/rails db:setup
```

## Load development seed data

After the database is prepared, load the Faker-generated demo data:

```bash
bin/rails db:seed
```

This creates users, workspaces, owner/admin/member memberships, epics, issues,
and comments. All generated users use the password `Password123!`; their
emails are `seed-user-1@example.com` through `seed-user-8@example.com`.

The seed script recreates only its own demo records, identified by the
`seed-user-*` emails and `DEMO1`–`DEMO3` workspace keys. It can be run again
without creating duplicates and does not remove unrelated application data.

## Run the app

```bash
bin/rails server
```

The API should start on the default Rails port (`http://localhost:3000`).

## API documentation

With the Rails server running, open the interactive Swagger UI:

<http://localhost:3000/api-docs/>

The source OpenAPI 3 document is available at
<http://localhost:3000/openapi.yaml> and is also checked into
`api/public/openapi.yaml`. The API uses a Rails session cookie, so authenticate
with `POST /api/v1/auth/login` before trying protected endpoints. Logout uses
`DELETE /api/v1/auth/logout`.

## Run tests

```bash
bundle exec rspec
```

## Run the standard check suite

```bash
bin/check
```

This command runs the Rails test suite, RuboCop auto-fix, Brakeman, Bundler Audit, and Importmap audit.

# Jira-like API

## Stack

### Backend

- Ruby 3.4.8
- Ruby on Rails 8
- PostgreSQL

### Key gems

- `bcrypt` for password hashing via `has_secure_password`
- `pundit` for workspace authorization policies
- `rspec-rails` for model/request specs
- `factory_bot_rails` for fixture factories
- `faker` for test data generation
- `shoulda-matchers` for validation assertions
- `rubocop` and `brakeman` for linting/security analysis

### Infrastructure

- Docker
- Docker Compose

## Local development

```bash
cd api
bundle install
bin/rails db:create
bin/rails db:schema:load
bin/rails server
```

## Running checks

Use the project check script for the usual validation pass:

```bash
cd api
bin/check
```

This runs the test suite, RuboCop auto-fix, Brakeman, bundler-audit, and importmap audit.

## Auth notes

User credentials are stored as a `password_digest`, and the `User` model uses Rails `has_secure_password` with `bcrypt`.

Authentication uses the Rails session. The implemented authentication endpoints are:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `DELETE /api/v1/auth/logout`

## Workspace API

Workspace endpoints require an authenticated session:

- `GET /api/v1/workspaces` — list the current user's workspaces
- `POST /api/v1/workspaces` — create a workspace and become its owner
- `GET /api/v1/workspaces/:id` — view a workspace as a member
- `PATCH /api/v1/workspaces/:id` — update as an owner or admin
- `DELETE /api/v1/workspaces/:id` — delete as an owner

Workspace access is enforced by Pundit. Members can view workspaces, admins can view and update them, and owners can view, update, and delete them.

## Epic API

Epic endpoints require an authenticated session and membership in the
corresponding workspace. Members, admins, and owners can use all Epic CRUD
operations:

- `GET /api/v1/workspaces/:workspace_id/epics` — list workspace epics
- `POST /api/v1/workspaces/:workspace_id/epics` — create an epic
- `GET /api/v1/epics/:id` — view an epic
- `PATCH /api/v1/epics/:id` — update an epic
- `DELETE /api/v1/epics/:id` — delete an epic

Non-members receive `403 Forbidden`, including when accessing an Epic by ID.

## Domain model

The API includes users, workspaces, workspace memberships, epics, issues, and comments. Authentication, workspace CRUD, and Epic CRUD are implemented; issue, comment, and membership management endpoints remain planned. For the schema and relationships, see `docs/DB.md` and `docs/user_story.md`.

## Seed data

Load the Faker-generated development dataset with:

```bash
bin/rails db:seed
```

The seeds create 8 users, 3 workspaces, workspace memberships for all three
roles, 6 epics, 24 issues, and 48 comments. Every seed user uses:

```text
Password123!
```

Seed users use the `seed-user-1@example.com` through
`seed-user-8@example.com` email addresses. Demo workspaces use the `DEMO1`,
`DEMO2`, and `DEMO3` keys.

The seed script removes and recreates only those `seed-user-*` users and
`DEMO*` workspaces, so it can be rerun without accumulating duplicate demo
data. Unrelated application records are preserved.

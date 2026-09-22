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

## Domain model

The API includes users, workspaces, workspace memberships, epics, issues, and comments. For the schema and relationships, see `docs/DB.md` and `docs/user_story.md`.

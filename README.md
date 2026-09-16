# jira-like

Jira-like � Multi-tenant issue tracker

This repository contains the backend API for a Jira-inspired workspace-based issue tracker. The application is built with Ruby on Rails and follows a workspace/member model with secure user authentication, epics, issues, comments, and role-based permissions.

## Repository structure

- [`api/`](api/README.md) � Rails API app with models, database schema, tests, and configuration.
- [`docs/`](docs/README.md) � project documentation covering setup, environment variables, schema, and user stories.
- [`web/`](web/README.md) � frontend placeholder for future UI work.

## Current implementation status

- Rails API backend is the main implemented component.
- Users are backed by `password_digest` and `has_secure_password` using `bcrypt`.
- Workspaces, memberships, epics, issues, and comments are modeled in the API.
- Model specs cover validations and associations for the core domain objects.
- The frontend application is still a placeholder and not yet implemented.

## Quick start

1. Install Ruby dependencies in `api/`.
2. Configure PostgreSQL connection variables.
3. Create and migrate the database.
4. Run the Rails server or the standard project checks with `bin/check`.

See the docs for exact commands and environment setup.

## Documentation map

- [`docs/SETUP.md`](docs/SETUP.md) � local development setup
- [`docs/ENV_USAGE.md`](docs/ENV_USAGE.md) � required PostgreSQL and Rails environment variables
- [`docs/DB.md`](docs/DB.md) � schema reference and relationship overview
- [`docs/user_story.md`](docs/user_story.md) � role-based stories and API scope
- [`api/README.md`](api/README.md) � API-level commands and notes
- [`web/README.md`](web/README.md) � frontend placeholder

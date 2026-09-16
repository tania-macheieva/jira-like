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

## Run the app

```bash
bin/rails server
```

The API should start on the default Rails port (`http://localhost:3000`).

## Run tests

```bash
bundle exec rspec
```

## Run the standard check suite

```bash
bin/check
```

This command runs the Rails test suite, RuboCop auto-fix, Brakeman, Bundler Audit, and Importmap audit.

# Database Reference

This document summarizes the current database model for the Rails API.

- Source of truth: `api/db/schema.rb`
- Format: DBML-style reference for readability
- DBML docs: https://dbml.dbdiagram.io/docs

![DB Schema](images/db-schema.png)

```dbml
Enum issue_type {
  task
  bug
  story
  feature
}

Enum issue_status {
  to_do
  in_progress
  review
  qa
  done
}

Enum roles {
  owner
  admin
  member
}

Table users {
  id bigint [pk, increment]
  name varchar [not null]
  email varchar [not null, unique]
  password_digest varchar [not null]
  created_at datetime
  updated_at datetime
}

Table workspaces {
  id bigint [pk, increment]
  name varchar [not null]
  key varchar [not null, unique]
  created_at datetime
  updated_at datetime
}

Table workspace_memberships {
  id bigint [pk, increment]
  user_id bigint [not null]
  workspace_id bigint [not null]
  role roles [not null]
  created_at datetime
  updated_at datetime

  indexes {
    (user_id, workspace_id) [unique]
  }
}

Table epics {
  id bigint [pk, increment]
  workspace_id bigint [not null]
  name varchar [not null]
  description text
  created_at datetime
  updated_at datetime
}

Table issues {
  id bigint [pk, increment]
  workspace_id bigint [not null]
  epic_id bigint
  creator_id bigint [not null]
  assignee_id bigint
  title varchar [not null]
  description text
  status issue_status [not null, default: 'to_do']
  type issue_type [not null, default: 'task']
  created_at datetime
  updated_at datetime
}

Table comments {
  id bigint [pk, increment]
  issue_id bigint [not null]
  user_id bigint [not null]
  body text [not null]
  created_at datetime
  updated_at datetime
}

Ref: workspace_memberships.user_id > users.id
Ref: workspace_memberships.workspace_id > workspaces.id

Ref: epics.workspace_id > workspaces.id

Ref: issues.workspace_id > workspaces.id
Ref: issues.epic_id > epics.id
Ref: issues.creator_id > users.id
Ref: issues.assignee_id > users.id

Ref: comments.issue_id > issues.id
Ref: comments.user_id > users.id
```

## Key relationships

- `users` ↔ `workspaces` is many-to-many through `workspace_memberships`, with `role` (`roles` enum: `owner`, `admin`, `member`) indicating the user's role in that workspace.
- `workspaces` has many `epics`.
- `workspaces` has many `issues`.
- `epics` has many `issues`, but an issue's `epic_id` is optional — an issue can exist without an epic.
- `issues` has many `comments`.
- `users` has many `issues` as creator (`creator_id`, required) and may have many `issues` as assignee (`assignee_id`, optional).
- `users` has many `comments` (each comment belongs to exactly one author).
- `issues.status` and `issues.type` are constrained by the `issue_status` and `issue_type` enums, respectively.
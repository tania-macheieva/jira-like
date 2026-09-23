**Jira-like API user stories**

![CLASS Diagram](images/class-diagram.png)

The API currently implements session-based authentication, workspace CRUD, and Epic CRUD with role-based authorization. User credentials are stored using `password_digest` and Rails `has_secure_password` with `bcrypt`. Workspace and Epic authorization are enforced with Pundit.

**Guest**

* As a guest, I can register a new account: `POST /api/v1/auth/register`
* As a guest, I can log in and receive an authenticated session: `POST /api/v1/auth/login`
* As an authenticated user, I can log out and clear my session: `DELETE /api/v1/auth/logout`

**Authenticated user**

* As an authenticated user, I can view my own profile: `GET /api/v1/auth/me`
* As an authenticated user, I can list workspaces available to me: `GET /api/v1/workspaces`
* As an authenticated user, I can view a workspace detail: `GET /api/v1/workspaces/:id`
* As an authenticated user, I can create a new workspace and become its owner: `POST /api/v1/workspaces`
* As an owner or admin, I can update a workspace: `PATCH /api/v1/workspaces/:id`
* As an owner, I can delete a workspace: `DELETE /api/v1/workspaces/:id`

**Workspace Member (Role: member)**

* As a workspace member, I can view a workspace: `GET /api/v1/workspaces/:id`
* As a workspace member, I can list epics in the workspace: `GET /api/v1/workspaces/:workspace_id/epics`
* As a workspace member, I can create an epic: `POST /api/v1/workspaces/:workspace_id/epics`
* As a workspace member, I can view an epic: `GET /api/v1/epics/:id`
* As a workspace member, I can update an epic: `PATCH /api/v1/epics/:id`
* As a workspace member, I can delete an epic: `DELETE /api/v1/epics/:id`

**Workspace Admin (Role: admin)**

* As a workspace admin, I can view a workspace: `GET /api/v1/workspaces/:id`
* As a workspace admin, I can update workspace details: `PATCH /api/v1/workspaces/:id`

**Workspace Owner (Role: owner)**

* As a workspace owner, I can view and update workspace details: `GET /api/v1/workspaces/:id`, `PATCH /api/v1/workspaces/:id`
* As a workspace owner, I can delete the workspace: `DELETE /api/v1/workspaces/:id`

## Planned workspace features

Membership management, issues, and comments are modeled in the database but their API endpoints are not implemented yet.

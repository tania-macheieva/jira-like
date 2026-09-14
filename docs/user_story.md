**Jira-like API user stories**

![CLASS Diagram](images/class-diagram.png)

**Guest**

* As a guest, I can register a new account: `POST /api/v1/auth/register`
* As a guest, I can log in and receive an authentication token: `POST /api/v1/auth/login`

**Authenticated user**

* As an authenticated user, I can view my own profile: `GET /api/v1/users/me`
* As an authenticated user, I can view public profile details of another user: `GET /api/v1/users/:id`
* As an authenticated user, I can list workspaces available to me: `GET /api/v1/workspaces`
* As an authenticated user, I can view a workspace detail: `GET /api/v1/workspaces/:id`
* As an authenticated user, I can create a new workspace and become its owner: `POST /api/v1/workspaces`

**Workspace Member (Role: member)**

* As a workspace member, I can list epics in my workspace: `GET /api/v1/workspaces/:workspace_id/epics`
* As a workspace member, I can view epic details: `GET /api/v1/epics/:id`
* As a workspace member, I can list workspace members: `GET /api/v1/workspaces/:workspace_id/memberships`
* As a workspace member, I can list issues in my workspace: `GET /api/v1/workspaces/:workspace_id/issues`
* As a workspace member, I can filter issues by status (`to_do`, `in_progress`, `review`, `qa`, `done`), type (`task`, `bug`, `story`, `feature`), or epic: `GET /api/v1/workspaces/:workspace_id/issues?status=...&type=...&epic_id=...`
* As a workspace member, I can view an issue detail: `GET /api/v1/issues/:id`
* As a workspace member, I can create an issue in my workspace, optionally attaching it to an epic: `POST /api/v1/workspaces/:workspace_id/issues`
* As a workspace member, I can change the status of an issue: `PATCH /api/v1/issues/:id/status`
* As a workspace member, I can assign an issue to a member: `PATCH /api/v1/issues/:id/assign`
* As a workspace member, I can view comments on an issue: `GET /api/v1/issues/:issue_id/comments`
* As a workspace member, I can leave a comment on an issue: `POST /api/v1/issues/:issue_id/comments`

**Workspace Admin (Role: admin)**

* As a workspace admin, I can add a new member to the workspace with a role (`admin` or `member`): `POST /api/v1/workspaces/:workspace_id/memberships`
* As a workspace admin, I can update a member's role between `admin` and `member`: `PATCH /api/v1/workspaces/:workspace_id/memberships/:id`
* As a workspace admin, I can remove a member from the workspace: `DELETE /api/v1/workspaces/:workspace_id/memberships/:id`
* As a workspace admin, I can create a new epic in the workspace: `POST /api/v1/workspaces/:workspace_id/epics`
* As a workspace admin, I can update epic details: `PATCH /api/v1/epics/:id`
* As a workspace admin, I can delete an epic: `DELETE /api/v1/epics/:id`
* As a workspace admin, I can update issue details (title, description, type, epic): `PATCH /api/v1/issues/:id`
* As a workspace admin, I can delete an issue: `DELETE /api/v1/issues/:id`
* As a workspace admin, I can delete any comment on an issue: `DELETE /api/v1/comments/:id`

**Workspace Owner (Role: owner)**

* As a workspace owner, I can update workspace details: `PATCH /api/v1/workspaces/:id`
* As a workspace owner, I can delete the workspace: `DELETE /api/v1/workspaces/:id`
* As a workspace owner, I can promote a member to admin or demote an admin to member: `PATCH /api/v1/workspaces/:workspace_id/memberships/:id`
* As a workspace owner, I can transfer ownership to another member, while the workspace always keeps exactly one owner: `PATCH /api/v1/workspaces/:workspace_id/memberships/:id`
* As a workspace owner, I can remove any admin or member from the workspace: `DELETE /api/v1/workspaces/:workspace_id/memberships/:id`
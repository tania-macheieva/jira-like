# Web frontend

The frontend is a React application built with Vite. It provides the main
workspace planning experience against the Rails API.

## Local development

```bash
cd web
npm install
npm run dev
```

The Vite development server proxies `/api` requests to the Rails API. Start the
API separately from `api/` with `bin/rails server`.

## Available views

- Registration, login, current-user session handling, and logout
- Workspace list and workspace creation
- Project summary with issue, epic, sprint, and completed-issue counts
- Issue board grouped by status
- Backlog grouped by sprint
- Active sprint view
- Epic list with issues and issue creation

Production builds can be created with:

```bash
npm run build
```

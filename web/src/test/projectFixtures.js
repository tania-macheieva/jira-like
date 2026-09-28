export const issues = [
  {
    id: 1,
    title: "Build UI",
    status: "to_do",
    issue_type: "task",
    sprint_id: 3,
    epic_id: 5,
  },
  {
    id: 2,
    title: "Fix login",
    status: "done",
    issue_type: "bug",
    sprint_id: null,
    epic_id: null,
  },
];

export const epics = [
  { id: 5, name: "Launch", description: "First release", workspace_id: 7 },
];

export const sprints = [
  { id: 3, name: "Current", status: "active" },
  { id: 4, name: "Planned", status: "planned" },
];

import { useMemo, useState } from "react";
import IssueCard from "../components/IssueCard";

const SPRINT_STATUSES = ["planned", "active", "completed"];

function SprintSection({ sprint, issues, onIssueClick, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (event) => {
    event.stopPropagation();
    setSaving(true);
    await onUpdate(sprint, { status: event.target.value });
    setSaving(false);
  };

  const rename = async (event) => {
    event.stopPropagation();
    const name = window.prompt("Sprint name", sprint.name);
    if (!name || name === sprint.name) return;
    setSaving(true);
    await onUpdate(sprint, { name });
    setSaving(false);
  };

  return (
    <section className="sprint-section">
      <div className="sprint-heading">
        <span className="sprint-title">
          <button
            className="expand-button"
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${sprint.name}`}
          >
            {expanded ? "-" : "+"}
          </button>
          <strong>{sprint.name}</strong>
          <select
            className={`sprint-status ${sprint.status}`}
            value={sprint.status}
            onChange={updateStatus}
            disabled={saving}
            aria-label={`${sprint.name} status`}
          >
            {SPRINT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </span>
        <span className="sprint-actions">
          <small>
            {issues.length} {issues.length === 1 ? "issue" : "issues"}
          </small>
          <button
            type="button"
            className="text-button"
            onClick={rename}
            disabled={saving}
          >
            Rename
          </button>
          <button
            type="button"
            className="text-button danger-text"
            onClick={() => onDelete(sprint)}
            disabled={saving}
          >
            Delete
          </button>
        </span>
      </div>
      {expanded && (
        <div className="sprint-issues">
          {issues.map((issue) => (
            <button
              type="button"
              className="issue-link"
              key={issue.id}
              onClick={() => onIssueClick(issue)}
            >
              <b>ISSUE-{issue.id}</b>
              <span>{issue.title}</span>
              <small>{issue.status.replace("_", " ")}</small>
            </button>
          ))}
          {!issues.length && <p className="empty">No issues in this sprint.</p>}
        </div>
      )}
    </section>
  );
}

export default function BacklogPage({
  issues,
  epics,
  sprints,
  onCreateSprint,
  onIssueClick,
  onUpdateSprint,
  onDeleteSprint,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();
    return issues.filter(
      (issue) =>
        !query || `${issue.title} ${issue.id}`.toLowerCase().includes(query),
    );
  }, [issues, search]);
  const visibleSprints =
    statusFilter === "all"
      ? sprints
      : sprints.filter((sprint) => sprint.status === statusFilter);
  const unassigned = filteredIssues.filter((issue) => !issue.sprint_id);

  return (
    <section className="backlog">
      <div className="backlog-toolbar">
        <div>
          <strong>Backlog</strong>
          <span>
            {filteredIssues.length} of {issues.length} issues
          </span>
        </div>
        <button onClick={onCreateSprint}>Create sprint</button>
      </div>
      <div className="backlog-filters">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search issues..."
          aria-label="Search backlog issues"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter sprints by status"
        >
          <option value="all">All sprint statuses</option>
          {SPRINT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      {visibleSprints.map((sprint) => (
        <SprintSection
          key={sprint.id}
          sprint={sprint}
          issues={filteredIssues.filter(
            (issue) => issue.sprint_id === sprint.id,
          )}
          onIssueClick={onIssueClick}
          onUpdate={onUpdateSprint}
          onDelete={onDeleteSprint}
        />
      ))}
      <h3 className="board-title">Issues not assigned to a sprint</h3>
      <div className="backlog-list">
        {unassigned.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            epics={epics}
            onClick={() => onIssueClick(issue)}
          />
        ))}
        {!unassigned.length && (
          <p className="empty">
            {issues.length
              ? "All issues are assigned to a sprint."
              : "No issues yet."}
          </p>
        )}
      </div>
    </section>
  );
}

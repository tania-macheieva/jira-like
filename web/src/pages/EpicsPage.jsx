import { useState } from "react";
import { jsonRequest } from "../api/client";

function EpicRow({ epic, issues, onCreateIssue, onIssueClick }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <article className="epic-group">
      <button
        type="button"
        className="epic-row"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="expand">{expanded ? "-" : "+"}</span>
        <span className="epic-summary">
          <b>{epic.name}</b>
          <small>{epic.description || "No description"}</small>
        </span>
        <span className="epic-count">
          {issues.length} {issues.length === 1 ? "issue" : "issues"}
        </span>
      </button>
      {expanded && (
        <div className="epic-issues">
          {issues.map((issue) => (
            <div className="epic-issue" key={issue.id}>
              <span className={`type ${issue.issue_type}`}>
                {issue.issue_type}
              </span>
              <b>ISSUE-{issue.id}</b>
              <button
                type="button"
                className="issue-link"
                onClick={() => onIssueClick(issue)}
              >
                {issue.title}
              </button>
              <small>{issue.status.replace("_", " ")}</small>
            </div>
          ))}
          <button type="button" className="add-issue" onClick={onCreateIssue}>
            + Create issue
          </button>
          {!issues.length && (
            <p className="empty">This epic has no issues yet.</p>
          )}
        </div>
      )}
    </article>
  );
}

export default function EpicsPage({
  epics,
  issues,
  onCreate,
  onIssueCreated,
  onIssueClick,
}) {
  const createEpicIssue = async (epic) => {
    const title = window.prompt(`Issue for ${epic.name}`);
    if (!title) return;
    try {
      const data = await jsonRequest(
        `/workspaces/${epic.workspace_id}/issues`,
        "POST",
        {
          issue: {
            title,
            issue_type: "task",
            status: "to_do",
            epic_id: epic.id,
          },
        },
      );
      onIssueCreated(data.issue);
    } catch (requestError) {
      window.alert(requestError.message);
    }
  };

  return (
    <section className="epics-page">
      <div className="backlog-toolbar">
        <strong>Epics</strong>
        <button onClick={onCreate}>Create epic</button>
      </div>
      <div className="epic-list">
        {epics.map((epic) => (
          <EpicRow
            key={epic.id}
            epic={epic}
            issues={issues.filter((issue) => issue.epic_id === epic.id)}
            onCreateIssue={() => createEpicIssue(epic)}
            onIssueClick={onIssueClick}
          />
        ))}
        {!epics.length && <p className="empty">No epics yet</p>}
      </div>
    </section>
  );
}

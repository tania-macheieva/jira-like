export default function IssueCard({ issue, epics, onClick }) {
  return (
    <button type="button" className="issue-card" onClick={onClick}>
      <small>ISSUE-{issue.id}</small>
      <b>{issue.title}</b>
      <div className="issue-meta">
        <span className={`type ${issue.issue_type}`}>{issue.issue_type}</span>
        {issue.epic_id && (
          <span>
            {epics.find((epic) => epic.id === issue.epic_id)?.name ||
              `Epic #${issue.epic_id}`}
          </span>
        )}
      </div>
    </button>
  );
}

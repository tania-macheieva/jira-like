export default function ActiveSprintsPage({ issues, sprints, onIssueClick }) {
  const active = sprints.filter((sprint) => sprint.status === "active");

  return (
    <section>
      <div className="backlog-toolbar">
        <div>
          <strong>Active sprints</strong>
          <span>Work in progress</span>
        </div>
      </div>
      {active.map((sprint) => {
        const sprintIssues = issues.filter(
          (issue) => issue.sprint_id === sprint.id,
        );
        return (
          <div className="active-sprint" key={sprint.id}>
            <h3>
              {sprint.name}
              <small>{sprintIssues.length} issues</small>
            </h3>
            <div className="sprint-issue-list">
              {sprintIssues.map((issue) => (
                <button
                  type="button"
                  className="issue-link"
                  key={issue.id}
                  onClick={() => onIssueClick(issue)}
                >
                  <b>ISSUE-{issue.id}</b>
                  <span>{issue.title}</span>
                  <em>{issue.status.replace("_", " ")}</em>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {!active.length && <p className="empty">There are no active sprints.</p>}
    </section>
  );
}

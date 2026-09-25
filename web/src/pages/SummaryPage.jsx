export default function SummaryPage({ issues, epics, sprints }) {
  const activeSprint = sprints.find((sprint) => sprint.status === "active");

  return (
    <section className="summary">
      <h2>Project summary</h2>
      <div className="summary-grid">
        <div>
          <strong>{issues.length}</strong>
          <span>Issues</span>
        </div>
        <div>
          <strong>{epics.length}</strong>
          <span>Epics</span>
        </div>
        <div>
          <strong>{sprints.length}</strong>
          <span>Sprints</span>
        </div>
        <div>
          <strong>
            {issues.filter((issue) => issue.status === "done").length}
          </strong>
          <span>Done issues</span>
        </div>
      </div>
      <div className="summary-panel">
        <h3>Current sprint</h3>
        {activeSprint ? (
          <p>
            <b>{activeSprint.name}</b> -{" "}
            {
              issues.filter((issue) => issue.sprint_id === activeSprint.id)
                .length
            }{" "}
            issues
          </p>
        ) : (
          <p>No active sprint.</p>
        )}
      </div>
    </section>
  );
}

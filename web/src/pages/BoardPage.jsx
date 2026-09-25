import IssueCard from "../components/IssueCard";

const STATUSES = [
  ["to_do", "To do"],
  ["in_progress", "In progress"],
  ["review", "Review"],
  ["qa", "QA"],
  ["done", "Done"],
];

export default function BoardPage({ issues, epics, onIssueClick }) {
  return (
    <section>
      <div className="backlog-toolbar">
        <div>
          <strong>Board</strong>
          <span>All project issues</span>
        </div>
      </div>
      <div className="board">
        {STATUSES.map(([status, label]) => {
          const statusIssues = issues.filter(
            (issue) => issue.status === status,
          );
          return (
            <section className="board-column" key={status}>
              <h3>
                {label} <span>{statusIssues.length}</span>
              </h3>
              {statusIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  epics={epics}
                  onClick={() => onIssueClick(issue)}
                />
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}

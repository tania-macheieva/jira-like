import { PROJECT_VIEWS } from "../constants/project";
import ErrorBanner from "./ErrorBanner";
import IssueDetailModal from "./IssueDetailModal";
import ActiveSprintsPage from "../pages/ActiveSprintsPage";
import BacklogPage from "../pages/BacklogPage";
import BoardPage from "../pages/BoardPage";
import EpicsPage from "../pages/EpicsPage";
import SummaryPage from "../pages/SummaryPage";

function Sidebar({ workspaces, selected, busy, onCreate, onSelect }) {
  return (
    <aside>
      <h2>Workspaces</h2>
      <button onClick={onCreate} disabled={busy}>
        + Workspace
      </button>
      {workspaces.map((workspace) => (
        <button
          type="button"
          aria-current={selected?.id === workspace.id ? "page" : undefined}
          className={selected?.id === workspace.id ? "selected" : ""}
          key={workspace.id}
          onClick={() => onSelect(workspace)}
        >
          {workspace.key} - {workspace.name}
        </button>
      ))}
    </aside>
  );
}

function Tabs({ view, onChange }) {
  return (
    <nav className="tabs">
      {PROJECT_VIEWS.map(([key, label]) => (
        <button
          type="button"
          aria-current={view === key ? "page" : undefined}
          className={view === key ? "active" : ""}
          key={key}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function ProjectPage({ view, data, actions }) {
  const { issues, epics, sprints } = data;
  if (view === "summary") return <SummaryPage {...data} />;
  if (view === "board")
    return (
      <BoardPage
        issues={issues}
        epics={epics}
        onIssueClick={actions.selectIssue}
      />
    );
  if (view === "backlog")
    return (
      <BacklogPage
        issues={issues}
        epics={epics}
        sprints={sprints}
        onCreateSprint={actions.createSprint}
        onIssueClick={actions.selectIssue}
        onUpdateSprint={actions.updateSprint}
        onDeleteSprint={actions.deleteSprint}
      />
    );
  if (view === "active-sprints")
    return (
      <ActiveSprintsPage
        issues={issues}
        sprints={sprints}
        onIssueClick={actions.selectIssue}
      />
    );
  return (
    <EpicsPage
      epics={epics}
      issues={issues}
      onCreate={actions.createEpic}
      onIssueCreated={actions.addIssue}
      onIssueClick={actions.selectIssue}
    />
  );
}

export default function WorkspaceShell({
  user,
  workspaceData,
  actions,
  onLogout,
  loggingOut,
  view,
  onViewChange,
}) {
  const {
    workspaces,
    selected,
    epics,
    issues,
    sprints,
    error,
    loading,
    workspaceLoading,
    busy,
    selectedIssue,
    setSelectedIssue,
    setIssues,
    setError,
  } = workspaceData;
  const issueActions = {
    ...actions,
    addIssue: (issue) => setIssues((current) => [...current, issue]),
    selectIssue: setSelectedIssue,
  };
  const data = { issues, epics, sprints };

  return (
    <main className="app">
      <header>
        <strong>Jira-like</strong>
        <span>
          {user.name} ({user.email})
        </span>
        <button onClick={onLogout} disabled={loggingOut}>
          Log out
        </button>
      </header>
      <ErrorBanner message={error} onDismiss={() => setError("")} />
      <section className="layout">
        <Sidebar
          workspaces={workspaces}
          selected={selected}
          busy={busy}
          onCreate={actions.createWorkspace}
          onSelect={workspaceData.selectWorkspace}
        />
        <section className="content">
          {loading ? (
            <p className="empty-page">Loading workspaces...</p>
          ) : !selected ? (
            <div className="empty-page">
              <h2>No workspace yet</h2>
              <p>Create a workspace to start planning.</p>
              <button onClick={actions.createWorkspace} disabled={busy}>
                Create workspace
              </button>
            </div>
          ) : workspaceLoading ? (
            <p className="empty-page">Loading {selected.name}...</p>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">{selected.key} / PROJECT</p>
                  <h1>{selected.name}</h1>
                </div>
                <div className="heading-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => workspaceData.selectWorkspace(selected)}
                  >
                    Refresh
                  </button>
                  <button onClick={actions.createIssue} disabled={busy}>
                    Create issue
                  </button>
                </div>
              </div>
              <Tabs view={view} onChange={onViewChange} />
              <ProjectPage view={view} data={data} actions={issueActions} />
            </>
          )}
        </section>
      </section>
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          currentUser={user}
          epics={epics}
          sprints={sprints}
          onClose={() => setSelectedIssue(null)}
          onUpdated={(issue) => {
            setIssues((current) =>
              current.map((item) => (item.id === issue.id ? issue : item)),
            );
            setSelectedIssue(issue);
          }}
          onDeleted={(id) => {
            setIssues((current) => current.filter((item) => item.id !== id));
            setSelectedIssue(null);
          }}
        />
      )}
    </main>
  );
}

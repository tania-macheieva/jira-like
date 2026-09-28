import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WorkspaceShell from "./WorkspaceShell";
import { jsonRequest, request } from "../lib/apiClient";
import { epics, issues, sprints } from "../test/projectFixtures";

vi.mock("../lib/apiClient", () => ({
  jsonRequest: vi.fn(),
  request: vi.fn(),
}));

const workspace = { id: 7, key: "DEMO", name: "Demo workspace" };
const user = { id: 12, name: "Dev", email: "dev@example.com" };

function createWorkspaceData(overrides = {}) {
  return {
    workspaces: [workspace],
    selected: workspace,
    epics,
    issues,
    sprints,
    error: "",
    loading: false,
    workspaceLoading: false,
    busy: false,
    selectedIssue: null,
    setSelectedIssue: vi.fn(),
    setIssues: vi.fn(),
    setError: vi.fn(),
    selectWorkspace: vi.fn(),
    ...overrides,
  };
}

function createActions(overrides = {}) {
  return {
    createWorkspace: vi.fn(),
    createIssue: vi.fn(),
    createEpic: vi.fn(),
    createSprint: vi.fn(),
    updateSprint: vi.fn(),
    deleteSprint: vi.fn(),
    addIssue: vi.fn(),
    selectIssue: vi.fn(),
    ...overrides,
  };
}

function renderShell(overrides = {}) {
  const props = {
    user,
    workspaceData: overrides.workspaceData || createWorkspaceData(),
    actions: overrides.actions || createActions(),
    onLogout: vi.fn(),
    loggingOut: false,
    view: "summary",
    onViewChange: vi.fn(),
    ...overrides,
  };
  return { ...render(<WorkspaceShell {...props} />), props };
}

describe("WorkspaceShell", () => {
  beforeEach(() => {
    request.mockReset();
    jsonRequest.mockReset();
  });

  it("renders loading, no-workspace, and workspace-loading states", () => {
    const { rerender } = renderShell({
      workspaceData: createWorkspaceData({ loading: true }),
    });
    expect(screen.getByText("Loading workspaces...")).toBeInTheDocument();

    rerender(
      <WorkspaceShell
        user={user}
        workspaceData={createWorkspaceData({ workspaces: [], selected: null })}
        actions={createActions()}
        onLogout={vi.fn()}
        loggingOut={false}
        view="summary"
        onViewChange={vi.fn()}
      />,
    );
    expect(screen.getByText("No workspace yet")).toBeInTheDocument();

    rerender(
      <WorkspaceShell
        user={user}
        workspaceData={createWorkspaceData({ workspaceLoading: true })}
        actions={createActions()}
        onLogout={vi.fn()}
        loggingOut={false}
        view="summary"
        onViewChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Loading Demo workspace...")).toBeInTheDocument();
  });

  it("switches views, selects workspaces, refreshes, and forwards logout", async () => {
    const workspaceData = createWorkspaceData({
      workspaces: [workspace, { id: 8, key: "OPS", name: "Operations" }],
    });
    const actions = createActions();
    const onLogout = vi.fn();
    const onViewChange = vi.fn();
    const shellProps = {
      user,
      workspaceData,
      actions,
      onLogout,
      loggingOut: false,
      onViewChange,
    };
    const { rerender } = render(
      <WorkspaceShell {...shellProps} view="summary" />,
    );

    expect(screen.getByText("Dev (dev@example.com)")).toBeInTheDocument();
    expect(screen.getByText("Issues").previousElementSibling).toHaveTextContent(
      "2",
    );
    fireEvent.click(screen.getByRole("button", { name: "Board" }));
    expect(onViewChange).toHaveBeenCalledWith("board");
    rerender(<WorkspaceShell {...shellProps} view="board" />);
    expect(screen.getByText("All project issues")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Backlog" }));
    rerender(<WorkspaceShell {...shellProps} view="backlog" />);
    expect(
      screen.getByText("Backlog", { selector: "strong" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Active sprints" }));
    rerender(<WorkspaceShell {...shellProps} view="active-sprints" />);
    expect(screen.getByText("Work in progress")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Epics" }));
    rerender(<WorkspaceShell {...shellProps} view="epics" />);
    expect(screen.getByText("First release")).toBeInTheDocument();
    vi.stubGlobal(
      "prompt",
      vi.fn(() => "Epic issue"),
    );
    jsonRequest.mockResolvedValue({ issue: { id: 10, title: "Epic issue" } });
    fireEvent.click(screen.getByRole("button", { name: "+ Create issue" }));
    await waitFor(() =>
      expect(workspaceData.setIssues).toHaveBeenCalledWith(
        expect.any(Function),
      ),
    );
    const addIssueUpdater = workspaceData.setIssues.mock.calls.at(-1)[0];
    expect(addIssueUpdater(issues)).toEqual([
      ...issues,
      { id: 10, title: "Epic issue" },
    ]);

    fireEvent.click(screen.getByRole("button", { name: /OPS - Operations/ }));
    expect(workspaceData.selectWorkspace).toHaveBeenCalledWith({
      id: 8,
      key: "OPS",
      name: "Operations",
    });
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(workspaceData.selectWorkspace).toHaveBeenLastCalledWith(workspace);
    fireEvent.click(screen.getByRole("button", { name: "Create issue" }));
    expect(actions.createIssue).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("disables workspace actions while busy and dismisses errors", () => {
    const workspaceData = createWorkspaceData({
      error: "Could not load workspace",
      busy: true,
    });
    const { props } = renderShell({ workspaceData });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load workspace",
    );
    fireEvent.click(screen.getByRole("button", { name: "Dismiss error" }));
    expect(workspaceData.setError).toHaveBeenCalledWith("");
    expect(screen.getByRole("button", { name: "+ Workspace" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Create issue" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(props.onLogout).toHaveBeenCalledOnce();
  });

  it("wires selected issue updates and deletion back to workspace data", async () => {
    request.mockResolvedValue({ comments: [] });
    const selectedIssue = issues[0];
    const workspaceData = createWorkspaceData({ selectedIssue });
    renderShell({ workspaceData });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated issue" },
    });
    jsonRequest.mockResolvedValue({
      issue: { ...selectedIssue, title: "Updated issue" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(workspaceData.setIssues).toHaveBeenCalledWith(
        expect.any(Function),
      ),
    );

    const latestIssueUpdater = workspaceData.setIssues.mock.calls.at(-1)[0];
    expect(latestIssueUpdater(issues)).toEqual([
      { ...selectedIssue, title: "Updated issue" },
      issues[1],
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(workspaceData.setSelectedIssue).toHaveBeenCalledWith(null);
  });

  it("removes a deleted issue and closes its details", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    request.mockImplementation((path) =>
      path.endsWith("/comments")
        ? Promise.resolve({ comments: [] })
        : Promise.resolve(null),
    );
    const workspaceData = createWorkspaceData({ selectedIssue: issues[0] });
    renderShell({ workspaceData });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() =>
      expect(workspaceData.setSelectedIssue).toHaveBeenCalledWith(null),
    );
    expect(request).toHaveBeenCalledWith("/issues/1", { method: "DELETE" });
    const latestIssueUpdater = workspaceData.setIssues.mock.calls.at(-1)[0];
    expect(latestIssueUpdater(issues)).toEqual([issues[1]]);
  });

  it("disables logout while logout is in progress", () => {
    renderShell({ loggingOut: true });

    expect(screen.getByRole("button", { name: "Log out" })).toBeDisabled();
  });
});

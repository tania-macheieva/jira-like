import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EpicsPage from "./EpicsPage";
import { jsonRequest } from "../lib/apiClient";
import { epics, issues } from "../test/projectFixtures";

vi.mock("../lib/apiClient", () => ({ jsonRequest: vi.fn() }));

describe("EpicsPage", () => {
  beforeEach(() => jsonRequest.mockReset());

  it("creates an issue under an epic and reports the created issue", async () => {
    jsonRequest.mockResolvedValue({ issue: { id: 6, title: "New task" } });
    vi.stubGlobal(
      "prompt",
      vi.fn(() => "New task"),
    );
    const onIssueCreated = vi.fn();
    render(
      <EpicsPage
        epics={epics}
        issues={[]}
        onCreate={vi.fn()}
        onIssueCreated={onIssueCreated}
        onIssueClick={vi.fn()}
      />,
    );

    expect(
      screen.getByText("This epic has no issues yet."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "+ Create issue" }));
    expect(jsonRequest).toHaveBeenCalledWith("/workspaces/7/issues", "POST", {
      issue: {
        title: "New task",
        issue_type: "task",
        status: "to_do",
        epic_id: 5,
      },
    });
    await waitFor(() =>
      expect(onIssueCreated).toHaveBeenCalledWith({
        id: 6,
        title: "New task",
      }),
    );
  });

  it("alerts when issue creation fails and skips an empty prompt", async () => {
    jsonRequest.mockResolvedValue({ issue: { id: 6, title: "Task" } });
    const alert = vi.fn();
    vi.stubGlobal(
      "prompt",
      vi.fn(() => "Task"),
    );
    vi.spyOn(window, "alert").mockImplementation(alert);
    const props = {
      epics,
      issues: [],
      onCreate: vi.fn(),
      onIssueCreated: () => {
        throw new Error("Could not add issue to workspace");
      },
      onIssueClick: vi.fn(),
    };
    const { rerender } = render(<EpicsPage {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "+ Create issue" }));
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith("Could not add issue to workspace"),
    );

    vi.stubGlobal(
      "prompt",
      vi.fn(() => ""),
    );
    jsonRequest.mockClear();
    rerender(<EpicsPage {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "+ Create issue" }));
    expect(jsonRequest).not.toHaveBeenCalled();
  });

  it("creates epics, collapses epic issues, and shows the empty state", () => {
    const onCreate = vi.fn();
    const onIssueClick = vi.fn();
    const { rerender } = render(
      <EpicsPage
        epics={epics}
        issues={issues}
        onCreate={onCreate}
        onIssueCreated={vi.fn()}
        onIssueClick={onIssueClick}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Create epic" }));
    expect(onCreate).toHaveBeenCalledOnce();
    expect(screen.getByText("First release")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Launch/ }));
    expect(screen.queryByText("Build UI")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Launch/ }));
    fireEvent.click(screen.getByRole("button", { name: "Build UI" }));
    expect(onIssueClick).toHaveBeenCalledWith(issues[0]);

    rerender(
      <EpicsPage
        epics={[]}
        issues={[]}
        onCreate={onCreate}
        onIssueCreated={vi.fn()}
        onIssueClick={onIssueClick}
      />,
    );
    expect(screen.getByText("No epics yet")).toBeInTheDocument();
  });
});

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BacklogPage from "./BacklogPage";
import { epics, issues, sprints } from "../test/projectFixtures";

const defaultProps = {
  issues,
  epics,
  sprints,
  onCreateSprint: vi.fn(),
  onIssueClick: vi.fn(),
  onUpdateSprint: vi.fn(),
  onDeleteSprint: vi.fn(),
};

describe("BacklogPage", () => {
  it("filters issues and sprints", () => {
    render(<BacklogPage {...defaultProps} />);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Search backlog issues" }),
      { target: { value: "login" } },
    );
    expect(screen.getByText("Fix login")).toBeInTheDocument();
    expect(screen.queryByText("Build UI")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filter sprints by status"), {
      target: { value: "planned" },
    });
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
    expect(screen.getByText("Planned")).toBeInTheDocument();
    expect(screen.getByText("No issues in this sprint.")).toBeInTheDocument();
  });

  it("runs sprint and issue actions", async () => {
    const props = {
      ...defaultProps,
      onCreateSprint: vi.fn(),
      onIssueClick: vi.fn(),
      onUpdateSprint: vi.fn(),
      onDeleteSprint: vi.fn(),
    };
    vi.stubGlobal(
      "prompt",
      vi.fn(() => "Renamed sprint"),
    );
    render(<BacklogPage {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Create sprint" }));
    expect(props.onCreateSprint).toHaveBeenCalledOnce();
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Current status"), {
        target: { value: "completed" },
      });
    });
    expect(props.onUpdateSprint).toHaveBeenCalledWith(sprints[0], {
      status: "completed",
    });

    const currentSprint = screen
      .getByText("Current")
      .closest(".sprint-section");
    await waitFor(() =>
      expect(
        within(currentSprint).getByRole("button", { name: "Rename" }),
      ).toBeEnabled(),
    );
    fireEvent.click(
      within(currentSprint).getByRole("button", { name: "Rename" }),
    );
    expect(props.onUpdateSprint).toHaveBeenLastCalledWith(sprints[0], {
      name: "Renamed sprint",
    });
    await waitFor(() =>
      expect(
        within(currentSprint).getByRole("button", { name: "Delete" }),
      ).toBeEnabled(),
    );
    fireEvent.click(
      within(currentSprint).getByRole("button", { name: "Delete" }),
    );
    expect(props.onDeleteSprint).toHaveBeenCalledWith(sprints[0]);
    fireEvent.click(screen.getByRole("button", { name: /ISSUE-1.*Build UI/ }));
    expect(props.onIssueClick).toHaveBeenCalledWith(issues[0]);
    fireEvent.click(screen.getByRole("button", { name: /ISSUE-2.*Fix login/ }));
    expect(props.onIssueClick).toHaveBeenCalledWith(issues[1]);
  });

  it("collapses sprint issues and ignores an empty sprint name", () => {
    vi.stubGlobal(
      "prompt",
      vi.fn(() => ""),
    );
    const onUpdateSprint = vi.fn();
    render(<BacklogPage {...defaultProps} onUpdateSprint={onUpdateSprint} />);

    fireEvent.click(screen.getByRole("button", { name: "Collapse Current" }));
    expect(screen.queryByText("Build UI")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand Current" }));
    expect(screen.getByText("Build UI")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Rename" })[0]);
    expect(onUpdateSprint).not.toHaveBeenCalled();
  });

  it("shows the empty backlog message when there are no issues", () => {
    render(<BacklogPage {...defaultProps} issues={[]} sprints={[]} />);

    expect(screen.getByText("No issues yet.")).toBeInTheDocument();
    expect(screen.getByText("0 of 0 issues")).toBeInTheDocument();
  });
});

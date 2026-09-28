import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActiveSprintsPage from "./ActiveSprintsPage";
import { issues, sprints } from "../test/projectFixtures";

describe("ActiveSprintsPage", () => {
  it("shows active sprint issues and opens an issue", () => {
    const onIssueClick = vi.fn();
    render(
      <ActiveSprintsPage
        issues={issues}
        sprints={sprints}
        onIssueClick={onIssueClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /ISSUE-1.*Build UI/ }));
    expect(onIssueClick).toHaveBeenCalledWith(issues[0]);
    expect(screen.queryByText("Planned")).not.toBeInTheDocument();
  });

  it("shows an empty state when no sprint is active", () => {
    render(
      <ActiveSprintsPage
        issues={[]}
        sprints={[{ id: 4, name: "Planned", status: "planned" }]}
        onIssueClick={vi.fn()}
      />,
    );

    expect(
      screen.getByText("There are no active sprints."),
    ).toBeInTheDocument();
  });
});

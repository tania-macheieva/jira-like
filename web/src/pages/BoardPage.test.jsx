import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BoardPage from "./BoardPage";
import { epics, issues } from "../test/projectFixtures";

describe("BoardPage", () => {
  it("groups issues by status and opens a selected issue", () => {
    const onIssueClick = vi.fn();
    render(
      <BoardPage issues={issues} epics={epics} onIssueClick={onIssueClick} />,
    );

    expect(screen.getByText("To do")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Launch")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /ISSUE-1.*Build UI/ }));

    expect(onIssueClick).toHaveBeenCalledWith(issues[0]);
  });

  it("renders every status column when there are no issues", () => {
    render(<BoardPage issues={[]} epics={[]} onIssueClick={vi.fn()} />);

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("QA")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });
});

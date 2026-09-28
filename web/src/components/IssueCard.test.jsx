import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IssueCard from "./IssueCard";

describe("IssueCard", () => {
  const issue = {
    id: 8,
    title: "Investigate",
    issue_type: "bug",
    epic_id: 2,
  };

  it("shows issue details, resolves epic names, and handles unknown epics", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <IssueCard
        issue={issue}
        epics={[{ id: 2, name: "Quality" }]}
        onClick={onClick}
      />,
    );

    expect(screen.getByText("Quality")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /ISSUE-8.*Investigate/ }),
    );
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<IssueCard issue={issue} epics={[]} onClick={onClick} />);
    expect(screen.getByText("Epic #2")).toBeInTheDocument();
  });

  it("omits the epic when the issue is not assigned to one", () => {
    render(
      <IssueCard
        issue={{ ...issue, epic_id: null }}
        epics={[]}
        onClick={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Epic #/)).not.toBeInTheDocument();
  });
});

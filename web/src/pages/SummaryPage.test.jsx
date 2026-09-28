import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SummaryPage from "./SummaryPage";
import { epics, issues, sprints } from "../test/projectFixtures";

describe("SummaryPage", () => {
  it("shows project totals and active sprint details", () => {
    render(<SummaryPage issues={issues} epics={epics} sprints={sprints} />);

    expect(screen.getByText("Project summary")).toBeInTheDocument();
    expect(screen.getByText("Issues").previousElementSibling).toHaveTextContent(
      "2",
    );
    expect(screen.getByText("Epics").previousElementSibling).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByText("Done issues").previousElementSibling,
    ).toHaveTextContent("1");
    expect(screen.getByText("Current").parentElement).toHaveTextContent(
      "1 issues",
    );
  });

  it("shows the empty state when there is no active sprint", () => {
    render(
      <SummaryPage
        issues={[]}
        epics={[]}
        sprints={[{ id: 4, name: "Planned", status: "planned" }]}
      />,
    );

    expect(screen.getByText("No active sprint.")).toBeInTheDocument();
  });
});

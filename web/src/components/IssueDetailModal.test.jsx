import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import IssueDetailModal from "./IssueDetailModal";
import { jsonRequest, request } from "../lib/apiClient";

vi.mock("../lib/apiClient", () => ({
  jsonRequest: vi.fn(),
  request: vi.fn(),
}));

const issue = {
  id: 8,
  title: "Investigate",
  description: "Initial description",
  status: "to_do",
  issue_type: "task",
  epic_id: null,
  sprint_id: null,
};
const user = { id: 12, name: "Dev" };
const props = {
  issue,
  currentUser: user,
  epics: [{ id: 3, name: "Quality" }],
  sprints: [{ id: 4, name: "Current sprint" }],
  onClose: vi.fn(),
  onUpdated: vi.fn(),
  onDeleted: vi.fn(),
};

describe("IssueDetailModal", () => {
  beforeEach(() => {
    request.mockReset();
    jsonRequest.mockReset();
    props.onClose.mockReset();
    props.onUpdated.mockReset();
    props.onDeleted.mockReset();
  });

  it("loads comments, saves issue fields, and adds a comment", async () => {
    request.mockResolvedValue({ comments: [] });
    jsonRequest
      .mockResolvedValueOnce({
        comment: { id: 4, body: "Looks good", user_id: user.id },
      })
      .mockResolvedValueOnce({
        issue: {
          ...issue,
          title: "Investigate API",
          epic_id: 3,
          sprint_id: 4,
        },
      });
    render(<IssueDetailModal {...props} />);

    expect(await screen.findByText("No comments yet.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Add a comment" }), {
      target: { value: "Looks good" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    expect(await screen.findByText("Looks good")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Investigate API" },
    });
    fireEvent.change(screen.getByLabelText("Epic"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Sprint"), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Issue updated successfully.",
    );
    expect(jsonRequest).toHaveBeenNthCalledWith(
      2,
      "/issues/8",
      "PATCH",
      expect.objectContaining({
        issue: expect.objectContaining({
          title: "Investigate API",
          epic_id: "3",
          sprint_id: "4",
        }),
      }),
    );
    expect(props.onUpdated).toHaveBeenCalledWith({
      ...issue,
      title: "Investigate API",
      epic_id: 3,
      sprint_id: 4,
    });
  });

  it("edits and deletes owned comments, then deletes the issue", async () => {
    const comment = { id: 4, body: "Needs work", user_id: user.id };
    request.mockImplementation((path) =>
      path.endsWith("/comments")
        ? Promise.resolve({ comments: [comment] })
        : Promise.resolve(null),
    );
    jsonRequest.mockResolvedValue({
      comment: { ...comment, body: "Fixed" },
    });
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    render(<IssueDetailModal {...props} />);

    expect(await screen.findByText("Needs work")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit comment" }), {
      target: { value: "Fixed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(jsonRequest).toHaveBeenCalledWith("/comments/4", "PATCH", {
        comment: { body: "Fixed" },
      }),
    );
    expect(await screen.findByText("Fixed")).toBeInTheDocument();

    const commentArticle = screen.getByText("Fixed").closest("article");
    fireEvent.click(
      within(commentArticle).getByRole("button", { name: "Delete" }),
    );
    await waitFor(() =>
      expect(screen.queryByText("Fixed")).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(props.onDeleted).toHaveBeenCalledWith(issue.id));
    expect(request).toHaveBeenCalledWith("/comments/4", { method: "DELETE" });
    expect(request).toHaveBeenCalledWith("/issues/8", { method: "DELETE" });
  });

  it("shows comment load errors and closes from the button or backdrop", async () => {
    request.mockRejectedValue(new Error("Could not load comments"));
    const { container } = render(<IssueDetailModal {...props} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load comments",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Close issue details" }),
    );
    fireEvent.mouseDown(container.querySelector(".modal-backdrop"), {
      target: container.querySelector(".modal-backdrop"),
      currentTarget: container.querySelector(".modal-backdrop"),
    });
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });

  it("does not submit blank comments and cannot edit another user's comment", async () => {
    request.mockResolvedValue({
      comments: [{ id: 9, body: "Private", user_id: 99 }],
    });
    render(<IssueDetailModal {...props} />);

    expect(await screen.findByText("Private")).toBeInTheDocument();
    expect(
      within(screen.getByText("Private").closest(".comment")).queryByRole(
        "button",
        { name: "Edit" },
      ),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByText("Private").closest(".comment")).queryByRole(
        "button",
        { name: "Delete" },
      ),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Add a comment" }), {
      target: { value: "   " },
    });
    expect(screen.getByRole("button", { name: "Comment" })).toBeDisabled();
    expect(jsonRequest).not.toHaveBeenCalled();
  });

  it("keeps the modal open when issue deletion is cancelled", async () => {
    request.mockResolvedValue({ comments: [] });
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );
    render(<IssueDetailModal {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(request).not.toHaveBeenCalledWith("/issues/8", {
      method: "DELETE",
    });
  });

  it("allows cancelling comment edits and cancelling comment deletion", async () => {
    const comment = { id: 4, body: "Needs work", user_id: user.id };
    request.mockResolvedValue({ comments: [comment] });
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );
    render(<IssueDetailModal {...props} />);

    expect(await screen.findByText("Needs work")).toBeInTheDocument();
    const article = screen.getByText("Needs work").closest(".comment");
    fireEvent.click(within(article).getByRole("button", { name: "Edit" }));
    fireEvent.click(within(article).getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Needs work")).toBeInTheDocument();
    fireEvent.click(within(article).getByRole("button", { name: "Delete" }));

    expect(request).not.toHaveBeenCalledWith("/comments/4", {
      method: "DELETE",
    });
  });

  it("shows delete callback failures and re-enables issue deletion", async () => {
    request.mockResolvedValue({ comments: [] });
    props.onDeleted.mockImplementation(() => {
      throw new Error("Could not remove issue from list");
    });
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    render(<IssueDetailModal {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not remove issue from list",
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });
});

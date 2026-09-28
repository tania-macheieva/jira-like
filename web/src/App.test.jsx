import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { jsonRequest, request } from "./lib/apiClient";

vi.mock("./lib/apiClient", () => ({
  jsonRequest: vi.fn(),
  request: vi.fn(),
}));

const user = { id: 1, name: "Dev", email: "dev@example.com" };
const workspace = { id: 2, key: "DEMO", name: "Demo workspace" };

describe("App", () => {
  beforeEach(() => {
    request.mockReset();
    jsonRequest.mockReset();
  });

  it("authenticates, loads a workspace, switches views, and logs out", async () => {
    request.mockImplementation((path) => {
      if (path === "/auth/me") return Promise.resolve({ user });
      if (path === "/workspaces")
        return Promise.resolve({ workspaces: [workspace] });
      if (path.endsWith("/epics")) return Promise.resolve({ epics: [] });
      if (path.endsWith("/issues")) return Promise.resolve({ issues: [] });
      if (path.endsWith("/sprints")) return Promise.resolve({ sprints: [] });
      if (path === "/auth/logout") return Promise.resolve({});
      return Promise.reject(new Error(`Unexpected request: ${path}`));
    });
    render(<App />);

    expect(await screen.findByText("Demo workspace")).toBeInTheDocument();
    expect(screen.getByText("Project summary")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Board" }));
    expect(screen.getByText("All project issues")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByText("Sign in")).toBeInTheDocument();
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("/auth/logout", {
        method: "DELETE",
      }),
    );
  });

  it("shows the sign-in page when there is no current session", async () => {
    request.mockRejectedValue(new Error("Unauthorized"));
    render(<App />);

    expect(await screen.findByText("Sign in")).toBeInTheDocument();
    expect(screen.queryByText("Unauthorized")).not.toBeInTheDocument();
  });

  it("shows the empty workspace state for a signed-in user", async () => {
    request.mockImplementation((path) => {
      if (path === "/auth/me") return Promise.resolve({ user });
      if (path === "/workspaces") return Promise.resolve({ workspaces: [] });
      return Promise.reject(new Error(`Unexpected request: ${path}`));
    });
    render(<App />);

    expect(await screen.findByText("No workspace yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create workspace" }),
    ).toBeInTheDocument();
  });

  it("authenticates after login and loads workspace data", async () => {
    let currentUserLookups = 0;
    request.mockImplementation((path) => {
      if (path === "/auth/me") {
        currentUserLookups += 1;
        return currentUserLookups === 1
          ? Promise.reject(new Error("Unauthorized"))
          : Promise.resolve({ user });
      }
      if (path === "/workspaces") return Promise.resolve({ workspaces: [] });
      return Promise.reject(new Error(`Unexpected request: ${path}`));
    });
    jsonRequest.mockResolvedValue({});
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("No workspace yet")).toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(3);
    expect(jsonRequest).toHaveBeenCalledWith("/auth/login", "POST", {
      name: "",
      email: user.email,
      password: "secret123",
      password_confirmation: "",
    });
  });

  it("keeps the workspace open and shows an error when logout fails", async () => {
    request.mockImplementation((path) => {
      if (path === "/auth/me") return Promise.resolve({ user });
      if (path === "/workspaces") return Promise.resolve({ workspaces: [] });
      if (path === "/auth/logout")
        return Promise.reject(new Error("Logout failed"));
      return Promise.reject(new Error(`Unexpected request: ${path}`));
    });
    render(<App />);
    expect(await screen.findByText("No workspace yet")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Logout failed");
    expect(screen.getByText("No workspace yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeEnabled();
  });
});

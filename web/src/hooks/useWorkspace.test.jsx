import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useWorkspace from "./useWorkspace";
import { jsonRequest, request } from "../lib/apiClient";

vi.mock("../lib/apiClient", () => ({
  jsonRequest: vi.fn(),
  request: vi.fn(),
}));

const workspace = { id: 7, key: "DEMO", name: "Demo" };

describe("useWorkspace", () => {
  beforeEach(() => {
    request.mockReset();
    jsonRequest.mockReset();
    vi.stubGlobal("prompt", vi.fn());
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
  });

  it("loads workspaces and selects the first workspace with its data", async () => {
    request.mockImplementation(async (path) => {
      if (path === "/workspaces") return { workspaces: [workspace] };
      if (path.endsWith("/epics"))
        return { epics: [{ id: 2, name: "Launch" }] };
      if (path.endsWith("/issues"))
        return { issues: [{ id: 3, title: "Ship" }] };
      return { sprints: [{ id: 4, name: "Sprint 1" }] };
    });
    const { result } = renderHook(() => useWorkspace());

    await act(() => result.current.loadWorkspaces());

    expect(result.current.workspaces).toEqual([workspace]);
    expect(result.current.selected).toEqual(workspace);
    expect(result.current.epics).toEqual([{ id: 2, name: "Launch" }]);
    expect(result.current.issues).toEqual([{ id: 3, title: "Ship" }]);
    expect(result.current.sprints).toEqual([{ id: 4, name: "Sprint 1" }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.workspaceLoading).toBe(false);
  });

  it("sets an error when selecting a workspace fails", async () => {
    request.mockRejectedValue(new Error("Could not load issues"));
    const { result } = renderHook(() => useWorkspace());

    await act(() => result.current.selectWorkspace(workspace));

    expect(result.current.selected).toEqual(workspace);
    expect(result.current.error).toBe("Could not load issues");
    expect(result.current.workspaceLoading).toBe(false);
  });

  it("ignores late results from a workspace that is no longer selected", async () => {
    const pending = {};
    request.mockImplementation((path) => {
      const [, , workspaceId, resource] = path.split("/");
      return new Promise((resolve) => {
        pending[`${workspaceId}-${resource}`] = resolve;
      });
    });
    const { result } = renderHook(() => useWorkspace());
    const firstWorkspace = { id: 1, name: "First" };
    const secondWorkspace = { id: 2, name: "Second" };

    await act(async () => {
      const firstLoad = result.current.selectWorkspace(firstWorkspace);
      const secondLoad = result.current.selectWorkspace(secondWorkspace);
      for (const resource of ["epics", "issues", "sprints"]) {
        pending[`2-${resource}`]({
          [resource]: [{ id: 20, name: `Second ${resource}` }],
        });
        pending[`1-${resource}`]({
          [resource]: [{ id: 10, name: `First ${resource}` }],
        });
      }
      await Promise.all([firstLoad, secondLoad]);
    });

    expect(result.current.selected).toEqual(secondWorkspace);
    expect(result.current.epics).toEqual([{ id: 20, name: "Second epics" }]);
    expect(result.current.issues).toEqual([{ id: 20, name: "Second issues" }]);
    expect(result.current.sprints).toEqual([
      { id: 20, name: "Second sprints" },
    ]);
    expect(result.current.workspaceLoading).toBe(false);
  });

  it("clears selection when no workspaces exist and reports load errors", async () => {
    request.mockResolvedValueOnce({ workspaces: [] });
    const { result } = renderHook(() => useWorkspace());

    await act(() => result.current.loadWorkspaces());

    expect(result.current.workspaces).toEqual([]);
    expect(result.current.selected).toBeNull();
    expect(result.current.loading).toBe(false);

    request.mockRejectedValueOnce(new Error("Could not load workspaces"));
    await act(() => result.current.loadWorkspaces());
    expect(result.current.error).toBe("Could not load workspaces");
    expect(result.current.loading).toBe(false);
  });

  it("creates an issue using the active sprint and updates the list", async () => {
    request.mockImplementation(async (path) => {
      if (path === "/workspaces") return { workspaces: [] };
      if (path.endsWith("/epics")) return { epics: [] };
      if (path.endsWith("/issues")) return { issues: [] };
      return { sprints: [{ id: 9, status: "active" }] };
    });
    const { result } = renderHook(() => useWorkspace());
    await act(() => result.current.loadWorkspaces());
    await act(() => result.current.selectWorkspace(workspace));
    vi.stubGlobal(
      "prompt",
      vi.fn(() => "Implement tests"),
    );
    jsonRequest.mockResolvedValue({
      issue: { id: 10, title: "Implement tests" },
    });

    act(() => result.current.createIssue());
    await waitFor(() =>
      expect(result.current.issues).toEqual([
        { id: 10, title: "Implement tests" },
      ]),
    );

    expect(jsonRequest).toHaveBeenCalledWith("/workspaces/7/issues", "POST", {
      issue: {
        title: "Implement tests",
        issue_type: "task",
        status: "to_do",
        sprint_id: 9,
      },
    });
    await waitFor(() => expect(result.current.busy).toBe(false));
  });

  it("assigns new issues to the first sprint when no sprint is active", async () => {
    request.mockImplementation(async (path) => {
      if (path.endsWith("/epics")) return { epics: [] };
      if (path.endsWith("/issues")) return { issues: [] };
      return { sprints: [{ id: 11, status: "planned" }] };
    });
    const { result } = renderHook(() => useWorkspace());
    await act(() => result.current.selectWorkspace(workspace));
    vi.stubGlobal(
      "prompt",
      vi.fn(() => "Use first sprint"),
    );
    jsonRequest.mockResolvedValue({
      issue: { id: 12, title: "Use first sprint" },
    });

    act(() => result.current.createIssue());
    await waitFor(() =>
      expect(result.current.issues).toEqual([
        { id: 12, title: "Use first sprint" },
      ]),
    );

    expect(jsonRequest).toHaveBeenCalledWith("/workspaces/7/issues", "POST", {
      issue: {
        title: "Use first sprint",
        issue_type: "task",
        status: "to_do",
        sprint_id: 11,
      },
    });
  });

  it("creates workspaces, epics, and sprints, then updates and deletes a sprint", async () => {
    request.mockImplementation(async (path) => {
      if (path.endsWith("/epics")) return { epics: [] };
      if (path.endsWith("/issues")) return { issues: [] };
      if (path.endsWith("/sprints")) {
        return { sprints: [{ id: 4, name: "Sprint 1", status: "planned" }] };
      }
      return null;
    });
    jsonRequest
      .mockResolvedValueOnce({ workspace })
      .mockResolvedValueOnce({ epic: { id: 5, name: "Roadmap" } })
      .mockResolvedValueOnce({
        sprint: { id: 6, name: "Sprint 2", status: "planned" },
      })
      .mockResolvedValueOnce({
        sprint: { id: 4, name: "Sprint 1", status: "active" },
      });
    vi.stubGlobal(
      "prompt",
      vi
        .fn()
        .mockReturnValueOnce("Demo")
        .mockReturnValueOnce("DEMO")
        .mockReturnValueOnce("Roadmap")
        .mockReturnValueOnce("Sprint 2"),
    );
    const { result } = renderHook(() => useWorkspace());

    act(() => result.current.createWorkspace());
    await waitFor(() => expect(result.current.workspaces).toEqual([workspace]));
    await waitFor(() => expect(result.current.sprints).toHaveLength(1));

    act(() => result.current.createEpic());
    await waitFor(() =>
      expect(result.current.epics).toEqual([{ id: 5, name: "Roadmap" }]),
    );

    act(() => result.current.createSprint());
    await waitFor(() => expect(result.current.sprints).toHaveLength(2));
    await act(async () => {
      await result.current.updateSprint(result.current.sprints[0], {
        status: "active",
      });
    });
    await waitFor(() =>
      expect(result.current.sprints[0].status).toBe("active"),
    );

    act(() => result.current.deleteSprint(result.current.sprints[0]));
    await waitFor(() => expect(result.current.sprints).toHaveLength(1));
    expect(jsonRequest).toHaveBeenNthCalledWith(1, "/workspaces", "POST", {
      workspace: { name: "Demo", key: "DEMO" },
    });
    expect(jsonRequest).toHaveBeenNthCalledWith(
      2,
      "/workspaces/7/epics",
      "POST",
      { epic: { name: "Roadmap" } },
    );
    expect(request).toHaveBeenCalledWith("/sprints/4", {
      method: "DELETE",
    });
  });

  it("does not delete a sprint unless confirmed", async () => {
    const { result } = renderHook(() => useWorkspace());
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );

    act(() => result.current.deleteSprint({ id: 4, name: "Sprint 1" }));

    expect(request).not.toHaveBeenCalled();
  });

  it("surfaces failed create actions and resets the busy state", async () => {
    request.mockImplementation(async (path) => {
      if (path.endsWith("/epics")) return { epics: [] };
      if (path.endsWith("/issues")) return { issues: [] };
      if (path.endsWith("/sprints")) return { sprints: [] };
      return null;
    });
    const { result } = renderHook(() => useWorkspace());
    await act(() => result.current.selectWorkspace(workspace));
    vi.stubGlobal(
      "prompt",
      vi.fn(() => "Broken epic"),
    );
    jsonRequest.mockRejectedValue(new Error("Could not create epic"));

    act(() => result.current.createEpic());

    await waitFor(() =>
      expect(result.current.error).toBe("Could not create epic"),
    );
    expect(result.current.busy).toBe(false);
  });
});

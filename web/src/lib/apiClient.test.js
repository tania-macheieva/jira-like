import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, request } from "./apiClient";

describe("request", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("requests the versioned API with cookies and JSON headers", async () => {
    fetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ workspaces: [] }),
    });

    await expect(request("/workspaces")).resolves.toEqual({ workspaces: [] });
    expect(fetch).toHaveBeenCalledWith("/api/v1/workspaces", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("preserves request options and caller-provided headers", async () => {
    fetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ ok: true }),
    });

    await request("/issues", {
      method: "POST",
      headers: { Authorization: "Bearer token" },
      body: "{}",
    });

    expect(fetch).toHaveBeenCalledWith("/api/v1/issues", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
      method: "POST",
      body: "{}",
    });
  });

  it("returns null for a successful no-content response", async () => {
    fetch.mockResolvedValue({ status: 204, ok: true });

    await expect(
      request("/issues/1", { method: "DELETE" }),
    ).resolves.toBeNull();
  });

  it("uses the generic error when an error response is not valid JSON", async () => {
    fetch.mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    await expect(request("/issues")).rejects.toThrow("Request failed");
  });

  it.each([
    [{ error: "Not allowed" }, "Not allowed"],
    [
      { errors: ["Title is required", "Invalid status"] },
      "Title is required, Invalid status",
    ],
    [null, "Request failed"],
  ])("surfaces API errors %#", async (body, message) => {
    fetch.mockResolvedValue({
      status: 422,
      ok: false,
      json: async () => body,
    });

    await expect(request("/issues")).rejects.toThrow(message);
  });

  it("sends JSON payloads with the requested method", async () => {
    fetch.mockResolvedValue({
      status: 201,
      ok: true,
      json: async () => ({ issue: { id: 1 } }),
    });
    const payload = { issue: { title: "First issue" } };

    await jsonRequest("/workspaces/1/issues", "POST", payload);

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/workspaces/1/issues",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });
});

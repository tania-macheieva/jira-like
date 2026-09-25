import { useCallback, useRef, useState } from "react";
import { jsonRequest, request } from "../api/client";

export default function useWorkspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [epics, setEpics] = useState([]);
  const [issues, setIssues] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const requestId = useRef(0);

  const selectWorkspace = useCallback(async (workspace) => {
    const currentRequest = ++requestId.current;
    setSelected(workspace);
    setSelectedIssue(null);
    setEpics([]);
    setIssues([]);
    setSprints([]);
    setWorkspaceLoading(true);
    setError("");
    try {
      const [epicData, issueData, sprintData] = await Promise.all([
        request(`/workspaces/${workspace.id}/epics`),
        request(`/workspaces/${workspace.id}/issues`),
        request(`/workspaces/${workspace.id}/sprints`),
      ]);
      if (currentRequest !== requestId.current) return;
      setEpics(epicData.epics);
      setIssues(issueData.issues);
      setSprints(sprintData.sprints);
    } catch (requestError) {
      if (currentRequest === requestId.current) setError(requestError.message);
    } finally {
      if (currentRequest === requestId.current) setWorkspaceLoading(false);
    }
  }, []);

  const loadWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await request("/workspaces");
      setWorkspaces(data.workspaces);
      if (data.workspaces.length) await selectWorkspace(data.workspaces[0]);
      else setSelected(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [selectWorkspace]);

  const runAction = useCallback(async (action) => {
    try {
      setBusy(true);
      await action();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }, []);

  const createWorkspace = () => {
    const name = window.prompt("Workspace name");
    const key = window.prompt("Workspace key");
    if (!name || !key) return;
    runAction(async () => {
      const data = await jsonRequest("/workspaces", "POST", {
        workspace: { name, key },
      });
      setWorkspaces((current) => [...current, data.workspace]);
      selectWorkspace(data.workspace);
    });
  };

  const createEpic = () => {
    const name = window.prompt("Epic name");
    if (!name || !selected) return;
    runAction(async () => {
      const data = await jsonRequest(
        `/workspaces/${selected.id}/epics`,
        "POST",
        { epic: { name } },
      );
      setEpics((current) => [...current, data.epic]);
    });
  };

  const createIssue = () => {
    const title = window.prompt("Issue title");
    if (!title || !selected) return;
    const sprint =
      sprints.find((item) => item.status === "active") || sprints[0];
    runAction(async () => {
      const data = await jsonRequest(
        `/workspaces/${selected.id}/issues`,
        "POST",
        {
          issue: {
            title,
            issue_type: "task",
            status: "to_do",
            sprint_id: sprint?.id,
          },
        },
      );
      setIssues((current) => [...current, data.issue]);
    });
  };

  const createSprint = () => {
    const name = window.prompt("Sprint name");
    if (!name || !selected) return;
    runAction(async () => {
      const data = await jsonRequest(
        `/workspaces/${selected.id}/sprints`,
        "POST",
        { sprint: { name, status: "planned" } },
      );
      setSprints((current) => [...current, data.sprint]);
    });
  };

  const updateSprint = (sprint, attributes) =>
    runAction(async () => {
      const data = await jsonRequest(`/sprints/${sprint.id}`, "PATCH", {
        sprint: attributes,
      });
      setSprints((current) =>
        current.map((item) => (item.id === sprint.id ? data.sprint : item)),
      );
    });

  const deleteSprint = (sprint) => {
    if (
      !window.confirm(`Delete "${sprint.name}"? Issues will become unassigned.`)
    )
      return;
    runAction(async () => {
      await request(`/sprints/${sprint.id}`, { method: "DELETE" });
      setSprints((current) => current.filter((item) => item.id !== sprint.id));
    });
  };

  const reset = () => {
    setWorkspaces([]);
    setSelected(null);
    setEpics([]);
    setIssues([]);
    setSprints([]);
    setSelectedIssue(null);
  };

  return {
    workspaces,
    selected,
    epics,
    issues,
    sprints,
    error,
    loading,
    workspaceLoading,
    busy,
    selectedIssue,
    setSelectedIssue,
    setIssues,
    setError,
    loadWorkspaces,
    selectWorkspace,
    createWorkspace,
    createEpic,
    createIssue,
    createSprint,
    updateSprint,
    deleteSprint,
    reset,
  };
}

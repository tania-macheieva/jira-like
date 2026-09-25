import { useEffect, useState } from "react";
import "./App.css";
import { request } from "./api/client";
import AuthPage from "./pages/AuthPage";
import WorkspaceShell from "./components/WorkspaceShell";
import useWorkspace from "./hooks/useWorkspace";

export default function App() {
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [view, setView] = useState("summary");
  const workspaceData = useWorkspace();
  const { loadWorkspaces, setError } = workspaceData;

  const authenticate = () =>
    request("/auth/me").then((data) => {
      setUser(data.user);
      loadWorkspaces();
    });

  useEffect(() => {
    request("/auth/me")
      .then((data) => {
        setUser(data.user);
        loadWorkspaces();
      })
      .catch(() => setError(""));
  }, [loadWorkspaces, setError]);

  if (!user) return <AuthPage onLogin={authenticate} />;

  const logout = async () => {
    try {
      setLoggingOut(true);
      await request("/auth/logout", { method: "DELETE" });
      setUser(null);
      workspaceData.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <WorkspaceShell
      user={user}
      workspaceData={workspaceData}
      actions={workspaceData}
      onLogout={logout}
      loggingOut={loggingOut}
      view={view}
      onViewChange={setView}
    />
  );
}

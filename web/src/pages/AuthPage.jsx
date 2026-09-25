import { useState } from "react";
import { jsonRequest } from "../api/client";
import ErrorBanner from "../components/ErrorBanner";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegistering = mode === "register";

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setSubmitting(true);
      await jsonRequest(
        isRegistering ? "/auth/register" : "/auth/login",
        "POST",
        isRegistering ? { user: form } : form,
      );
      onLogin();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth">
      <h1>Jira-like</h1>
      <p>{isRegistering ? "Create an account" : "Sign in"}</p>
      <form onSubmit={submit}>
        {isRegistering && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) =>
            setForm({ ...form, password: event.target.value })
          }
          required
        />
        {isRegistering && (
          <input
            type="password"
            placeholder="Repeat password"
            value={form.password_confirmation}
            onChange={(event) =>
              setForm({ ...form, password_confirmation: event.target.value })
            }
            required
          />
        )}
        <button disabled={submitting}>
          {isRegistering ? "Register" : "Log in"}
        </button>
      </form>
      <ErrorBanner message={error} onDismiss={() => setError("")} />
      <button
        type="button"
        className="link"
        onClick={() => setMode(isRegistering ? "login" : "register")}
      >
        {isRegistering ? "Already have an account?" : "Need an account?"}
      </button>
    </main>
  );
}

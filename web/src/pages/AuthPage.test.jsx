import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthPage from "./AuthPage";
import { jsonRequest } from "../lib/apiClient";

vi.mock("../lib/apiClient", () => ({ jsonRequest: vi.fn() }));

describe("AuthPage", () => {
  beforeEach(() => jsonRequest.mockReset());

  it("submits login details and calls onLogin", async () => {
    jsonRequest.mockResolvedValue({});
    const onLogin = vi.fn();
    render(<AuthPage onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "dev@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(jsonRequest).toHaveBeenCalledWith("/auth/login", "POST", {
      name: "",
      email: "dev@example.com",
      password: "secret123",
      password_confirmation: "",
    });
    await waitFor(() => expect(onLogin).toHaveBeenCalledOnce());
  });

  it("submits registration details", async () => {
    jsonRequest.mockResolvedValue({});
    const onLogin = vi.fn();
    render(<AuthPage onLogin={onLogin} />);
    fireEvent.click(screen.getByRole("button", { name: "Need an account?" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Dev" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "dev@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(jsonRequest).toHaveBeenCalledWith("/auth/register", "POST", {
      user: {
        name: "Dev",
        email: "dev@example.com",
        password: "secret123",
        password_confirmation: "secret123",
      },
    });
    await waitFor(() => expect(onLogin).toHaveBeenCalledOnce());
  });

  it("shows request errors and lets the user dismiss them", async () => {
    jsonRequest.mockResolvedValue({});
    render(
      <AuthPage
        onLogin={() => {
          throw new Error("Session could not be loaded");
        }}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "dev@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Session could not be loaded",
    );
    fireEvent.click(screen.getByRole("button", { name: "Dismiss error" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("allows switching between login and registration modes", () => {
    render(<AuthPage onLogin={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Need an account?" }));
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Already have an account?" }),
    );

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument();
  });
});

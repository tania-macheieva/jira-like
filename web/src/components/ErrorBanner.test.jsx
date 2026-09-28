import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBanner from "./ErrorBanner";

describe("ErrorBanner", () => {
  it("renders errors and allows dismissing them", () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <ErrorBanner message="Request failed" onDismiss={onDismiss} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dismiss error" }));
    expect(onDismiss).toHaveBeenCalledOnce();
    rerender(<ErrorBanner message="" onDismiss={onDismiss} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

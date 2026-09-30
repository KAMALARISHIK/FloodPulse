import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { useAuthStore } from "@/store/authStore";

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe("Authentication & Login Validation", () => {
  beforeEach(() => {
    sessionStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("renders login form elements properly", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in to workspace/i })).toBeInTheDocument();
  });

  it("validates required empty fields on submit", async () => {
    const user = userEvent.setup();
    renderLogin();

    const submitBtn = screen.getByRole("button", { name: /Sign in to workspace/i });
    await user.click(submitBtn);

    expect(await screen.findByText("Email address is required.")).toBeInTheDocument();
    expect(await screen.findByText("Password is required.")).toBeInTheDocument();
  });

  it("validates invalid email formatting", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole("button", { name: /Sign in to workspace/i });

    await user.type(emailInput, "not-an-email");
    await user.type(passwordInput, "ValidPassword123");
    await user.click(submitBtn);

    expect(await screen.findByText("Please enter a valid email format.")).toBeInTheDocument();
  });

  it("shows error banner on incorrect credentials", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole("button", { name: /Sign in to workspace/i });

    await user.type(emailInput, "operator@floodpulse.demo");
    await user.type(passwordInput, "WrongPassword");
    await user.click(submitBtn);

    expect(
      await screen.findByText(/Invalid email or password\. Please check your credentials\./i)
    ).toBeInTheDocument();
  });

  it("autofills demo credentials when clicking Fill demo login", async () => {
    const user = userEvent.setup();
    renderLogin();

    const fillBtn = screen.getByRole("button", { name: /Fill demo login/i });
    await user.click(fillBtn);

    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^Password/i) as HTMLInputElement;

    expect(emailInput.value).toBe("operator@floodpulse.demo");
    expect(passwordInput.value).toBe("Flood@2026");
  });

  it("authenticates successfully with valid credentials", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole("button", { name: /Sign in to workspace/i });

    await user.type(emailInput, "operator@floodpulse.demo");
    await user.type(passwordInput, "Flood@2026");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.email).toBe("operator@floodpulse.demo");
    });
  });
});

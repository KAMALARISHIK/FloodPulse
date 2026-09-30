import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DraftAlertCard } from "@/components/map/DraftAlertCard";
import { useAuthStore } from "@/store/authStore";

describe("Role-Based UI Permissions", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("hides 'Approve and send' button for viewer role and displays read-only notice", () => {
    useAuthStore.setState({
      user: {
        email: "viewer@floodpulse.demo",
        name: "Suresh Kumar",
        role: "viewer",
        title: "Public Viewer",
      },
      token: "mock_jwt_viewer",
      isAuthenticated: true,
    });

    render(<DraftAlertCard />);

    expect(screen.queryByRole("button", { name: /Approve and send/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Viewer role: Read-only access/i)).toBeInTheDocument();
  });

  it("shows 'Approve and send' button for operator role", () => {
    useAuthStore.setState({
      user: {
        email: "operator@floodpulse.demo",
        name: "Ravi Shankar",
        role: "operator",
        title: "Operator",
      },
      token: "mock_jwt_operator",
      isAuthenticated: true,
    });

    render(<DraftAlertCard />);

    expect(screen.getByRole("button", { name: /Approve and send/i })).toBeInTheDocument();
    expect(screen.queryByText(/Viewer role: Read-only access/i)).not.toBeInTheDocument();
  });

  it("shows 'Approve and send' button for admin role", () => {
    useAuthStore.setState({
      user: {
        email: "admin@floodpulse.demo",
        name: "Dr. Anita Desai",
        role: "admin",
        title: "Admin",
      },
      token: "mock_jwt_admin",
      isAuthenticated: true,
    });

    render(<DraftAlertCard />);

    expect(screen.getByRole("button", { name: /Approve and send/i })).toBeInTheDocument();
  });
});

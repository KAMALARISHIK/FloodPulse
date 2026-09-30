/**
 * Demo User Accounts for Frontend Preview
 *
 * NOTE: These accounts are for UI prototyping and demonstration purposes only.
 * Production deployment will authenticate against the FastAPI backend with JWT/OIDC.
 */

export type UserRole = "admin" | "operator" | "viewer";

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  title: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: "operator@floodpulse.demo",
    password: "Flood@2026",
    name: "Ravi Shankar",
    role: "operator",
    title: "Emergency Response Operator",
  },
  {
    email: "admin@floodpulse.demo",
    password: "Admin@2026",
    name: "Dr. Anita Desai",
    role: "admin",
    title: "Chief Hydrological Officer",
  },
  {
    email: "viewer@floodpulse.demo",
    password: "View@2026",
    name: "Suresh Kumar",
    role: "viewer",
    title: "Public Observer / Viewer",
  },
];

export const DEFAULT_DEMO_USER = DEMO_USERS[0]; // operator

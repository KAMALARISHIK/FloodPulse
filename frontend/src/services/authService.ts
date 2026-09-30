/**
 * ==============================================================================
 * IMPORTANT SECURITY AND ARCHITECTURE NOTICE:
 * ==============================================================================
 * This `authService.ts` is a MOCK client-side authentication implementation
 * designed STRICTLY for UI design review and frontend preview.
 *
 * Client-side credential verification is NEVER secure and must NEVER be used in
 * production environments.
 *
 * When the FloodPulse FastAPI backend is operational, this single service file
 * will be swapped to authenticate against standard server-side endpoints
 * (`POST /api/v1/auth/token` with JWT / OAuth2 / OIDC).
 *
 * The `IAuthService` interface ensures a clean, zero-breaking-change drop-in replacement.
 * ==============================================================================
 */

import { DEMO_USERS, DemoUser, UserRole } from "@/config/demoUsers";

export interface AuthSession {
  user: {
    email: string;
    name: string;
    role: UserRole;
    title: string;
  };
  token: string;
  expiresAt: number;
}

export interface IAuthService {
  login(email: string, password: string): Promise<AuthSession>;
  logout(): Promise<void>;
  validateCredentials(email: string, password: string): DemoUser | null;
}

class MockAuthService implements IAuthService {
  /**
   * Validate against local demo credentials
   */
  validateCredentials(email: string, password: string): DemoUser | null {
    const cleanEmail = email.trim().toLowerCase();
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );
    return found || null;
  }

  /**
   * Simulate async authentication with network delay
   */
  async login(email: string, password: string): Promise<AuthSession> {
    // Artificial latency for calm UI loading feel (300-500ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const user = this.validateCredentials(email, password);
    if (!user) {
      throw new Error("Invalid email or password. Please check your credentials.");
    }

    const session: AuthSession = {
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        title: user.title,
      },
      token: `mock_jwt_${user.role}_${Date.now()}`,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    };

    return session;
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}

export const authService: IAuthService = new MockAuthService();

import { create } from "zustand";
import { UserRole } from "@/config/demoUsers";
import { authService, AuthSession } from "@/services/authService";

interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  title: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  introSeen: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setIntroSeen: (seen: boolean) => void;
  initFromStorage: () => void;
}

const SESSION_KEY = "floodpulse_session";
const INTRO_SEEN_KEY = "floodpulse_intro_seen";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  introSeen: typeof window !== "undefined" ? sessionStorage.getItem(INTRO_SEEN_KEY) === "true" : false,

  initFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      const introSeenVal = sessionStorage.getItem(INTRO_SEEN_KEY) === "true";
      if (stored) {
        const session = JSON.parse(stored) as AuthSession;
        if (session.expiresAt > Date.now()) {
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            introSeen: introSeenVal,
          });
          return;
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
      set({ introSeen: introSeenVal });
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authService.login(email, password);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      set({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_KEY);
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),

  setIntroSeen: (seen: boolean) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(INTRO_SEEN_KEY, seen ? "true" : "false");
    }
    set({ introSeen: seen });
  },
}));

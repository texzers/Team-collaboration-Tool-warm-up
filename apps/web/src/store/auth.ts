import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResponse } from '@teamflow/shared';

interface AuthState {
  user: AuthResponse['user'] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (data) => set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
      // Only persist the user, access token is usually kept in memory or handled via refresh mechanism,
      // but for simplicity in this frontend state, we'll keep it. 
      // Realistically we'd rely on the httpOnly cookie for session persistence.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

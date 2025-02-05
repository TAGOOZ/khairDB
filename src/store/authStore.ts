import { create } from 'zustand';
import { User } from '../types';
import { signInWithEmail, signOut, getCurrentUser } from '../services/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    const user = await signInWithEmail(email, password);
    set({ user });
  },
  signOut: async () => {
    await signOut();
    set({ user: null });
  },
  setUser: (user) => set({ user, loading: false }),
  initializeAuth: async () => {
    try {
      const user = await getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, loading: false });
    }
  }
}));

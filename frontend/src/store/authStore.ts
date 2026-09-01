import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user_data') || 'null'),
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  setAuth: (user: User, token: string) => {
    localStorage.setItem('user_data', JSON.stringify(user));
    localStorage.setItem('access_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasRole: (role: string) => {
    const user = get().user;
    if (!user) return false;
    return user.roles.includes(role as any);
  },
}));

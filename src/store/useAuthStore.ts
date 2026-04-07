import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'partner';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  
  login: (user, token) => {
    localStorage.setItem('accessToken', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
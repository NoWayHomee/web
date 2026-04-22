// src/store/useAuthStore.ts (Ví dụ nếu bạn dùng Zustand)
import { create } from 'zustand';
import apiClient from '../services/apiClient';

interface AuthState {
  user: any | null;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,

  login: async (credentials) => {
    try {
      // Gọi qua apiClient đã config ở trên
      const response: any = await apiClient.post('/auth/login', credentials);
      
      // Giả định NestJS trả về: { access_token: "...", user: {...} }
      const token = response.access_token || response.data?.access_token;
      const user = response.user || response.data?.user;

      if (token) {
        localStorage.setItem('access_token', token);
        set({ token, user });
      }
    } catch (error: any) {
      // Lỗi đã được apiClient format thành Error object
      throw new Error(error.message); 
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null });
  },
}));
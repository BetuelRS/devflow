import { create } from 'zustand';
import { api } from '../lib/api';
import { connectWS } from '../lib/ws';

interface User { id: string; username: string; email: string }

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  loading: true,
  login: async (email, password) => {
    const { token, user } = await api.auth.login({ email, password });
    localStorage.setItem('token', token);
    set({ token, user });
    connectWS(token);
  },
  register: async (username, email, password) => {
    const { token, user } = await api.auth.register({ username, email, password });
    localStorage.setItem('token', token);
    set({ token, user });
    connectWS(token);
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
  loadUser: async () => {
    try {
      const token = get().token || localStorage.getItem('token');
      if (!token) { set({ loading: false }); return; }
      const { user } = await api.auth.me();
      set({ user, loading: false });
      connectWS(token);
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, loading: false });
    }
  },
}));

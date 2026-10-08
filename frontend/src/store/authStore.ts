import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: Pick<User, 'id' | 'email' | 'username'> | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setTokens: (access: string, refresh: string) => void;
  setUser: (user: Pick<User, 'id' | 'email' | 'username'>) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,

  setTokens: (access, refresh) => {
    AsyncStorage.setItem('accessToken', access);
    AsyncStorage.setItem('refreshToken', refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  setUser: (user) => {
    AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    get().setTokens(data.accessToken, data.refreshToken);
    get().setUser(data.user);
  },

  register: async (email, username, password) => {
    const { data } = await api.post('/auth/register', { email, username, password });
    get().setTokens(data.accessToken, data.refreshToken);
    get().setUser(data.user);
  },

  logout: () => {
    AsyncStorage.removeItem('accessToken');
    AsyncStorage.removeItem('refreshToken');
    AsyncStorage.removeItem('user');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  loadSession: async () => {
    try {
      const [accessToken, refreshToken, userStr] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('user'),
      ]);

      if (accessToken && refreshToken && userStr) {
        set({
          accessToken,
          refreshToken,
          user: JSON.parse(userStr),
          isAuthenticated: true,
        });
      }
    } catch {
      // no session
    } finally {
      set({ isLoading: false });
    }
  },
}));

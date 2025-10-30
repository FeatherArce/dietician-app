import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PublicUser } from '@/services/server/auth';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

interface AuthState {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: PublicUser | null) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: string) => void;
  login: (user: PublicUser, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setTheme: (theme: string) => {
        localStorage.setItem(AUTH_CONSTANTS.PREFERENCE_THEME_KEY, theme);
      },

      login: (user, token) => {
        // 儲存 token 到 localStorage
        localStorage.setItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, token);
        localStorage.setItem(AUTH_CONSTANTS.PREFERENCE_THEME_KEY, user.preferred_theme || 'light');

        set({ 
          user, 
          isAuthenticated: true,
          isLoading: false 
        });
      },

      logout: async () => {
        try {
          // 呼叫 logout API
          await fetch('/api/auth/logout', { 
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)}`,
            }
          });
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          // 清除本地狀態
          localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
          
          // 重導向到登入頁
          window.location.href = '/auth/login';
        }
      },

      refreshUser: async () => {
        const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
        
        if (!token) {
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
          return;
        }

        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            set({ 
              user: data.user, 
              isAuthenticated: true,
              isLoading: false 
            });
          } else {
            // Token 無效，清除本地狀態
            localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Failed to refresh user:', error);
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        await get().refreshUser();
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 只持久化用戶資料，不持久化 loading 狀態
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// 便利的 hook，提供常用的認證狀態
export const useAuth = () => {
  const { user, isLoading, isAuthenticated, login, logout, refreshUser, initializeAuth } = useAuthStore();
  
  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    initializeAuth,
  };
};

// 選擇器 hooks，用於效能優化
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthStatus = () => useAuthStore((state) => state.isAuthenticated);
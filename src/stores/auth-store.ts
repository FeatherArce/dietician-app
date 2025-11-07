import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PublicUser } from '@/services/server/auth';
import { AUTH_CONSTANTS, ROUTE_CONSTANTS } from '@/constants/app-constants';

interface AuthState {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: PublicUser | null) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: string) => void;
  login: (user: PublicUser, token: string) => void;
  logout: () => Promise<void>;
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
        console.log('[AUTH STORE] Login called with:', {
          userEmail: user?.email,
          hasToken: !!token
        });

        // 檢查 token 是否存在
        if (!token) {
          console.error('[AUTH STORE] Login called without token');
          return;
        }

        // 儲存 token 到 localStorage
        localStorage.setItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, token);
        localStorage.setItem(AUTH_CONSTANTS.PREFERENCE_THEME_KEY, user.preferred_theme || 'light');

        set({
          user,
          isAuthenticated: true,
          isLoading: false
        });

        console.log('[AUTH STORE] Login state updated successfully');
      },

      logout: async () => {
        console.log('[AUTH STORE] Logout initiated');

        try {
          // 呼叫 logout API
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include', // 確保包含 cookies
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)}`,
            }
          });
          console.log('[AUTH STORE] Logout API called successfully');
        } catch (error) {
          console.error('[AUTH STORE] Logout API error:', error);
        } finally {
          // 清除所有本地狀態
          console.log('[AUTH STORE] Clearing local state');
          localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
          localStorage.removeItem(AUTH_CONSTANTS.PREFERENCE_THEME_KEY);

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });

          console.log('[AUTH STORE] Logout completed');
        }
      },

      refreshUser: async () => {
        const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);

        console.log('[AUTH STORE] Refreshing user, localStorage token exists:', !!token);

        try {
          // 總是嘗試調用 /api/auth/me，即使 localStorage 中沒有 token
          // 因為 httpOnly cookies 在伺服器端會自動發送，前端 JavaScript 無法存取
          console.log('[AUTH STORE] Calling /api/auth/me to verify session...');
          const response = await fetch('/api/auth/me', {
            credentials: 'include', // 確保 httpOnly cookies 被發送
            headers: {
              ...(token && { 'Authorization': `Bearer ${token}` }),
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[AUTH STORE] Successfully refreshed user:', data.user?.email);
            
            // 確保 localStorage 有 token（如果 API 返回的話）
            if (data.token) {
              localStorage.setItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, data.token);
            }
            
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            // API 驗證失敗，清除狀態
            console.log('[AUTH STORE] API verification failed, clearing state');
            localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('[AUTH STORE] Failed to refresh user:', error);
          localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      initializeAuth: async () => {
        console.log('[AUTH STORE] Initializing auth...');
        set({ isLoading: true });
        await get().refreshUser();
        console.log('[AUTH STORE] Auth initialization completed');
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
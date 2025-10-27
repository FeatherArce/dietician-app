/**
 * 帶有自動 token 刷新功能的 fetch 工具
 */
import { AUTH_CONSTANTS } from '@/constants/app-constants';

export interface AuthFetchOptions extends RequestInit {
  skipRefresh?: boolean; // 跳過自動刷新（避免無限循環）
}

/**
 * 嘗試刷新 access token
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(AUTH_CONSTANTS.REFRESH_ENDPOINT, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, data.access_token);
        return true;
      }
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }
  
  return false;
}

/**
 * 帶自動認證處理的 fetch
 */
export async function authFetch(url: string, options: AuthFetchOptions = {}): Promise<Response> {
  const { skipRefresh = false, ...fetchOptions } = options;
  
  // 獲取當前 token
  const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
  
  // 設置 Authorization header
  const headers = {
    ...fetchOptions.headers,
    'Authorization': `Bearer ${token}`
  };
  
  // 執行第一次請求
  const response = await fetch(url, {
    ...fetchOptions,
    headers
  });
  
  // 如果是 401 且未跳過刷新，嘗試刷新 token
  if (response.status === 401 && !skipRefresh) {
    const refreshSuccess = await refreshAccessToken();
    
    if (refreshSuccess) {
      // 刷新成功，重新發送請求
      const newToken = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
      const newHeaders = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${newToken}`
      };
      
      return fetch(url, {
        ...fetchOptions,
        headers: newHeaders
      });
    } else {
      // 刷新失敗，清除本地狀態並重定向到登入頁
      localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
      window.location.href = AUTH_CONSTANTS.LOGIN_REDIRECT;
    }
  }
  
  return response;
}

/**
 * 帶自動認證處理的 JSON fetch
 */
export async function authFetchJson<T = unknown>(
  url: string, 
  options: AuthFetchOptions = {}
): Promise<T> {
  const response = await authFetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}
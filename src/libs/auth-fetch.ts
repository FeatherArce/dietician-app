export interface AuthFetchOptions extends RequestInit {
  skipRefresh?: boolean; // 跳過自動刷新（避免無限循環）
}

/**
 * TODO: 遷移至使用一般的 fetch
 */
export async function authFetch(url: string, options: AuthFetchOptions = {}): Promise<Response> {
  const { skipRefresh = false, ...fetchOptions } = options;  
  
  // 設置 Authorization header
  const headers = {
    ...fetchOptions.headers,
  };
  
  // 執行第一次請求
  const response = await fetch(url, {
    ...fetchOptions,
    headers
  });
  
  return response;
}
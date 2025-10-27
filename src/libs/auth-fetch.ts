/**
 * 認證 HTTP 客戶端工具
 * 自動加入認證標頭的 fetch 包裝器
 */

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * 帶認證的 fetch 包裝器
 * @param url 請求 URL
 * @param options fetch 選項
 * @returns Promise<Response>
 */
export async function authenticatedFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const token = localStorage.getItem('auth-token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 如果有 token，加入 Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * 帶認證的 JSON 請求
 * @param url 請求 URL  
 * @param options fetch 選項
 * @returns Promise<unknown>
 */
export async function authenticatedFetchJson(url: string, options: FetchOptions = {}): Promise<unknown> {
  const response = await authenticatedFetch(url, options);
  return response.json();
}

/**
 * GET 請求
 */
export const authGet = (url: string) => authenticatedFetchJson(url);

/**
 * POST 請求
 */
export const authPost = (url: string, data?: unknown) => 
  authenticatedFetchJson(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

/**
 * PUT 請求
 */
export const authPut = (url: string, data?: unknown) => 
  authenticatedFetchJson(url, {
    method: 'PUT', 
    body: data ? JSON.stringify(data) : undefined,
  });

/**
 * DELETE 請求
 */
export const authDelete = (url: string) => 
  authenticatedFetchJson(url, { method: 'DELETE' });
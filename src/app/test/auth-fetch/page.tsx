/**
 * 測試 authFetch 功能的範例頁面
 * 
 * 這個頁面展示如何使用新的 authFetch 工具來：
 * 1. 自動處理 token 刷新
 * 2. 統一使用常數管理 localStorage keys
 * 3. 處理認證失敗的情況
 */

'use client';

import { useState } from 'react';
import { authFetch, authFetchJson } from '@/libs/auth-fetch';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

export default function AuthFetchTestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAuthFetch = async () => {
    setLoading(true);
    try {
      // 測試使用 authFetch 調用需要認證的 API
      const data = await authFetchJson('/api/auth/me');
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
    setResult(`當前 token: ${token || '無'}`);
  };

  const clearToken = () => {
    localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
    setResult('Token 已清除');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">AuthFetch 測試頁面</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testAuthFetch} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '測試中...' : '測試 AuthFetch'}
        </button>
        
        <button 
          onClick={checkToken}
          className="btn btn-secondary"
        >
          檢查當前 Token
        </button>
        
        <button 
          onClick={clearToken}
          className="btn btn-warning"
        >
          清除 Token
        </button>
      </div>

      <div className="bg-base-200 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">結果：</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {result || '尚未執行測試'}
        </pre>
      </div>

      <div className="mt-8 bg-info/10 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">功能說明：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>使用統一的常數 <code>AUTH_CONSTANTS.ACCESS_TOKEN_KEY</code> 管理 token</li>
          <li>自動處理 token 過期和刷新</li>
          <li>認證失敗時自動重定向到登入頁面</li>
          <li>統一的錯誤處理機制</li>
        </ul>
      </div>
    </div>
  );
}
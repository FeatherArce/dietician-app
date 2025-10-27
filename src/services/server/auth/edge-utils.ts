/**
 * Edge Runtime 兼容的工具函數
 */

/**
 * 生成安全的隨機 token（Edge Runtime 版本）
 * 使用 Web Crypto API 替代 Node.js crypto
 */
export function generateSecureToken(): string {
    // 在 Edge Runtime 中使用 Web Crypto API
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // 備用方法：使用 Math.random（較不安全，僅用於開發）
    console.warn('Using fallback random token generation - not recommended for production');
    return Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}

/**
 * 驗證 email 格式
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 驗證 username 格式
 */
export function isValidUsername(username: string): boolean {
    // 3-20 個字元，只能包含字母、數字、底線和破折號
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
}
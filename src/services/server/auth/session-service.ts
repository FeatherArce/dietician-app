import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@/prisma-generated/postgres-client';

// 使用者會話資料類型
export interface UserSession {
    userId: string;
    email: string;
    role: UserRole;
    iat: number; // 發行時間
    exp: number; // 過期時間
}

// 公開使用者資料類型（不包含敏感資訊）
export interface PublicUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    preferred_theme: string;
    created_at: Date;
    last_login?: Date;
    login_count: number;
}

// Token 選項
export interface TokenOptions {
    expiresIn?: string;
    audience?: string;
    issuer?: string;
}

/**
 * 會話管理服務
 * 提供 JWT token 的生成、驗證、刷新等功能
 * 設計為無狀態，支援水平擴展
 */
export class SessionService {
    // 預設 token 有效期
    private static readonly DEFAULT_EXPIRY = '7d';
    
    // Refresh token 有效期
    private static readonly REFRESH_EXPIRY = '30d';
    
    // Token 發行者
    private static readonly ISSUER = 'dietician-erp';
    
    // Token 接收者
    private static readonly AUDIENCE = 'dietician-erp-users';

    /**
     * 獲取 JWT 密鑰
     * @returns string JWT 密鑰
     */
    private static getSecretKey(): string {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            throw new Error('NEXTAUTH_SECRET environment variable is not set');
        }
        if (secret.length < 32) {
            throw new Error('NEXTAUTH_SECRET must be at least 32 characters long');
        }
        return secret;
    }

    /**
     * 生成訪問 token
     * @param user 使用者資料
     * @param options Token 選項
     * @returns string JWT token
     */
    static generateAccessToken(user: PublicUser, options: TokenOptions = {}): string {
        try {
            const payload: Omit<UserSession, 'iat' | 'exp'> = {
                userId: user.id,
                email: user.email,
                role: user.role
            };

            return jwt.sign(payload, this.getSecretKey(), {
                expiresIn: options.expiresIn || this.DEFAULT_EXPIRY,
                issuer: options.issuer || this.ISSUER,
                audience: options.audience || this.AUDIENCE,
                subject: user.id
            } as SignOptions);
        } catch (error) {
            console.error('Token generation failed:', error);
            throw new Error('Token 生成失敗');
        }
    }

    /**
     * 生成刷新 token
     * @param user 使用者資料
     * @returns string Refresh token
     */
    static generateRefreshToken(user: PublicUser): string {
        try {
            const payload = {
                userId: user.id,
                email: user.email,
                type: 'refresh'
            };

            return jwt.sign(payload, this.getSecretKey(), {
                expiresIn: this.REFRESH_EXPIRY,
                issuer: this.ISSUER,
                audience: this.AUDIENCE,
                subject: user.id
            } as SignOptions);
        } catch (error) {
            console.error('Refresh token generation failed:', error);
            throw new Error('Refresh token 生成失敗');
        }
    }

    /**
     * 驗證訪問 token
     * @param token JWT token
     * @returns UserSession | null 使用者會話資料或 null
     */
    static verifyAccessToken(token: string): UserSession | null {
        try {
            const decoded = jwt.verify(token, this.getSecretKey(), {
                issuer: this.ISSUER,
                audience: this.AUDIENCE
            }) as UserSession;

            // 檢查必要欄位
            if (!decoded.userId || !decoded.email || !decoded.role) {
                console.warn('Invalid token payload:', decoded);
                return null;
            }

            return decoded;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                console.warn('Token verification failed:', error.message);
            } else {
                console.error('Token verification error:', error);
            }
            return null;
        }
    }

    /**
     * 驗證刷新 token
     * @param token Refresh token
     * @returns object | null Token 資料或 null
     */
    static verifyRefreshToken(token: string): { userId: string; email: string } | null {
        try {
            const decoded = jwt.verify(token, this.getSecretKey(), {
                issuer: this.ISSUER,
                audience: this.AUDIENCE
            }) as { userId: string; email: string; type: string };

            if (decoded.type !== 'refresh' || !decoded.userId || !decoded.email) {
                return null;
            }

            return {
                userId: decoded.userId,
                email: decoded.email
            };
        } catch (error) {
            console.warn('Refresh token verification failed:', error);
            return null;
        }
    }

    /**
     * 刷新訪問 token
     * @param refreshToken Refresh token
     * @param getUserById 獲取使用者函數
     * @returns Promise<string | null> 新的訪問 token 或 null
     */
    static async refreshAccessToken(
        refreshToken: string,
        getUserById: (id: string) => Promise<PublicUser | null>
    ): Promise<string | null> {
        try {
            const refreshData = this.verifyRefreshToken(refreshToken);
            if (!refreshData) {
                return null;
            }

            // 檢查使用者是否仍然有效
            const user = await getUserById(refreshData.userId);
            if (!user || !user.is_active) {
                return null;
            }

            // 生成新的訪問 token
            return this.generateAccessToken(user);
        } catch (error) {
            console.error('Token refresh failed:', error);
            return null;
        }
    }

    /**
     * 解析 token（不驗證簽名）
     * @param token JWT token
     * @returns object | null Token 載荷或 null
     */
    static decodeToken(token: string): UserSession | null {
        try {
            return jwt.decode(token) as UserSession;
        } catch {
            return null;
        }
    }

    /**
     * 檢查 token 是否即將過期
     * @param token JWT token
     * @param bufferSeconds 緩衝時間（秒）
     * @returns boolean 是否即將過期
     */
    static isTokenExpiringSoon(token: string, bufferSeconds: number = 300): boolean {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true;
            }

            const expirationTime = decoded.exp * 1000; // 轉換為毫秒
            const currentTime = Date.now();
            const bufferTime = bufferSeconds * 1000;

            return (expirationTime - currentTime) <= bufferTime;
        } catch (error) {
            return true;
        }
    }

    /**
     * 獲取 token 剩餘有效時間
     * @param token JWT token
     * @returns number 剩餘秒數，-1 表示已過期或無效
     */
    static getTokenRemainingTime(token: string): number {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return -1;
            }

            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            const remainingTime = Math.floor((expirationTime - currentTime) / 1000);

            return remainingTime > 0 ? remainingTime : -1;
        } catch (error) {
            return -1;
        }
    }

    /**
     * 生成完整的認證 token 組合
     * @param user 使用者資料
     * @returns object 包含 accessToken 和 refreshToken
     */
    static generateTokenPair(user: PublicUser): {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    } {
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        
        // 計算 access token 過期時間（秒）
        const expiresIn = this.getTokenRemainingTime(accessToken);

        return {
            accessToken,
            refreshToken,
            expiresIn
        };
    }

    /**
     * 登出處理（加入黑名單）
     * 注意：這是簡化版本，實際應用中可能需要 Redis 等快取來維護黑名單
     * @param token JWT token
     * @returns Promise<boolean> 是否成功登出
     */
    static async logout(token: string): Promise<boolean> {
        try {
            // 在實際應用中，這裡應該將 token 加入黑名單
            // 例如：await redis.setex(`blacklist:${token}`, remainingTime, 'true');
            
            // 目前簡化實作，僅返回 true
            // 客戶端應該主動清除 token
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            return false;
        }
    }

    /**
     * 檢查 token 是否在黑名單中
     * @param token JWT token
     * @returns Promise<boolean> 是否在黑名單中
     */
    static async isTokenBlacklisted(token: string): Promise<boolean> {
        try {
            // 在實際應用中，這裡應該檢查 Redis 黑名單
            // const isBlacklisted = await redis.exists(`blacklist:${token}`);
            // return isBlacklisted === 1;
            
            // 目前簡化實作，返回 false
            return false;
        } catch (error) {
            console.error('Blacklist check failed:', error);
            return false;
        }
    }

    /**
     * 從 HTTP 請求中提取 token
     * @param authHeader Authorization header 值
     * @returns string | null Token 或 null
     */
    static extractTokenFromHeader(authHeader: string | null): string | null {
        if (!authHeader) {
            return null;
        }

        // 檢查 Bearer token 格式
        const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/);
        if (bearerMatch) {
            return bearerMatch[1];
        }

        // 檢查簡單 token 格式
        return authHeader.trim() || null;
    }

    /**
     * 生成安全的 session ID
     * @returns string 隨機 session ID
     */
    static generateSessionId(): string {
        const timestamp = Date.now().toString(36);
        const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        return `${timestamp}-${randomBytes}`;
    }
}
import jwt from 'jsonwebtoken';
import { UserRole } from '@/prisma-generated/postgres-client';

// 使用者會話資料類型
export interface UserSession {
    userId: string;
    username: string;
    email?: string;
    role: UserRole;
    iat: number; // 發行時間
    exp: number; // 過期時間
}

// 公開使用者資料類型（不包含敏感資訊）
export interface PublicUser {
    id: string;
    username: string;
    name: string;
    email?: string;
    role: UserRole;
    is_active: boolean;
    preferred_theme: string;
    created_at: Date;
    last_login?: Date;
    login_count: number;
}

/**
 * Edge Runtime 兼容的會話服務
 * 專門用於中間件和 Edge 環境
 */
export class EdgeSessionService {
    /**
     * 獲取 JWT 密鑰
     */
    private static getSecretKey(): string {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            throw new Error('NEXTAUTH_SECRET environment variable is not set');
        }
        return secret;
    }

    /**
     * 驗證訪問 token（Edge Runtime 版本）
     * @param token JWT token
     * @returns UserSession | null
     */
    static verifyAccessToken(token: string): UserSession | null {
        try {
            const decoded = jwt.verify(token, this.getSecretKey()) as UserSession;
            
            // 基本驗證
            if (!decoded.userId || !decoded.username || !decoded.role) {
                return null;
            }
            
            return decoded;
        } catch (error) {
            // Token 無效、過期或格式錯誤
            return null;
        }
    }

    /**
     * 簡單的 token 解碼（不驗證簽名，僅用於讀取 payload）
     * @param token JWT token
     * @returns Partial<UserSession> | null
     */
    static decodeToken(token: string): Partial<UserSession> | null {
        try {
            const decoded = jwt.decode(token) as UserSession;
            return decoded;
        } catch (error) {
            return null;
        }
    }
}
import prisma from "@/services/prisma"
import { PasswordService } from "@/services/server/auth/password-service"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"
import { UserRole } from "@/prisma-generated/postgres-client"

// 擴展 JWT 類型
declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        role?: string // 實際上會是 UserRole，但 JWT 只能存字串
    }
}

// 擴展 Session 和 User 類型
declare module "next-auth" {
    interface User {
        role?: UserRole
        email_verified?: boolean
        preferred_theme?: string
        is_active?: boolean | null        
        is_deleted?: boolean | null
        created_at?: Date | null
        last_login?: Date | null
        login_count?: number | null
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "請輸入 Email"
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "請輸入密碼"
                },
            },
            authorize: async (credentials) => {
                const email = credentials?.email as string;
                const password = credentials?.password as string;
                // logic to verify if the user exists
                const user = await prisma.user.findFirst({
                    where: {
                        email: email,
                        is_active: true
                    }
                });

                if (!user) {
                    // No user found, so this is their first attempt to login
                    // Optionally, this is also the place you could do a user registration
                    throw new Error("Invalid credentials.")
                }

                // 驗證密碼
                const isValidPassword = await PasswordService.verify(password, user.password_hash);

                if (!isValidPassword) {
                    throw new Error("Invalid credentials");
                }
                // return user object with their profile data
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    email_verified: user.email_verified,
                    preferred_theme: user.preferred_theme,
                    is_active: user.is_active,
                    created_at: user.created_at,
                    last_login: user.last_login,
                    login_count: user.login_count,
                }
            },
        }),
    ],

    // ===== SESSION 配置 =====
    session: {
        strategy: "jwt",          // 使用 JWT 會話策略
        maxAge: 24 * 60 * 60,     // 24 小時
        updateAge: 12 * 60 * 60,  // 12 小時更新一次
    },

    // ===== COOKIES 配置 =====
    cookies: {
        sessionToken: {
            name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
            options: {
                httpOnly: true,                           // 防止 XSS
                sameSite: "lax",                          // 防止 CSRF
                path: "/",
                secure: process.env.NODE_ENV === 'production'  // 只在 HTTPS
            }
        }
    },

    // ===== JWT 配置 =====
    jwt: {
        maxAge: 24 * 60 * 60,     // JWT 過期時間
    },

    // ===== Secret 配置（JWT 加密密鑰） =====
    secret: process.env.NEXTAUTH_SECRET,

    // ===== CALLBACKS（處理 Token 和 Session） =====
    callbacks: {
        // JWT 回調：在 token 中新增自訂資訊
        jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.email = user.email
            }
            return token
        },

        // Session 回調：決定要傳給客戶端的 session 內容
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role ? token.role as UserRole : undefined
                session.user.email = token.email as string
            }
            return session
        },

        // 登入時的回調
        async signIn({ profile, user, account, credentials }) {
            return user.email ? true : false;
        }
    },

    // ===== 安全性設定 =====
    trustHost: true,  // 允許使用 host header（Vercel/雲端平台需要）

    // ===== 自訂頁面 =====
    pages: {
        signIn: '/auth/login',
        error: '/auth/error'
    }
})
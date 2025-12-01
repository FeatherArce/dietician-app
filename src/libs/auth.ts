import { UserRole } from "@/prisma-generated/postgres-client";
import { getUserByEmail, registerOrConnectOAuthUser } from "@/services/auth/auth-services";
import { PasswordService } from "@/services/auth/password-service";
import userService from "@/services/user-services";
import type { Session } from "next-auth";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Discord, { DiscordProfile } from "next-auth/providers/discord";

// 擴展 JWT 類型
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string; // 實際上會是 UserRole，但 JWT 只能存字串
  }
}

// 擴展 Session 和 User 類型
declare module "next-auth" {
  interface User {
    role?: UserRole;
    email_verified?: boolean;
    preferred_theme?: string;
    is_active?: boolean | null;
    is_deleted?: boolean | null;
    created_at?: Date | null;
    last_login?: Date | null;
    login_count?: number | null;
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
          placeholder: "請輸入 Email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "請輸入密碼",
        },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        // logic to verify if the user exists
        const user = await getUserByEmail(email);

        if (user && (user.is_active === false || user.is_deleted === true)) {
          throw new Error("帳號已被停用或刪除，請聯絡管理員。");
        }

        if (!user || !user.password_hash) {
          throw new Error("Invalid credentials.");
        }

        // 驗證密碼
        const isValidPassword = await PasswordService.verify(
          password,
          user?.password_hash
        );

        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        // 更新登入狀態        
        await userService.updateLoginInfo(user.id);

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
        };
      },
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_APPLICATION_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: { params: { scope: "identify email" } },
    }),
  ],

  // ===== SESSION 配置 =====
  session: {
    strategy: "jwt", // 使用 JWT 會話策略
    maxAge: 24 * 60 * 60, // 24 小時
    updateAge: 12 * 60 * 60, // 12 小時更新一次
  },

  // ===== COOKIES 配置 =====
  cookies: {
    sessionToken: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }next-auth.session-token`,
      options: {
        httpOnly: true, // 防止 XSS
        sameSite: "lax", // 防止 CSRF
        path: "/",
        secure: process.env.NODE_ENV === "production", // 只在 HTTPS
      },
    },
  },

  // ===== JWT 配置 =====
  jwt: {
    maxAge: 24 * 60 * 60, // JWT 過期時間
  },

  // ===== Secret 配置（JWT 加密密鑰） =====
  secret: process.env.NEXTAUTH_SECRET,

  // ===== CALLBACKS（處理 Token 和 Session） =====
  callbacks: {
    // JWT 回調：在 token 中新增自訂資訊
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.preferred_theme = user.preferred_theme || "light";
      }
      return token;
    },

    // Session 回調：決定要傳給客戶端的 session 內容
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role ? (token.role as UserRole) : undefined;
        session.user.email = token.email as string;
        session.user.preferred_theme = token.preferred_theme as string || "light";
        session.user.is_active = token.is_active as boolean | null;
        session.user.is_deleted = token.is_deleted as boolean | null;
        session.user.created_at = token.created_at
          ? new Date(token.created_at as string)
          : null;
        session.user.last_login = token.last_login
          ? new Date(token.last_login as string)
          : null;
        session.user.login_count = token.login_count
          ? Number(token.login_count)
          : null;        
      }
      return session;
    },

    // 登入時的回調
    async signIn({ profile, user, account, credentials }) {
      if (account?.provider === "discord") {
        const discordProfile = profile as DiscordProfile;
        if (!discordProfile?.email || discordProfile.email === null) {
          return false; // Discord 未提供 email，拒絕登入
        }
        const image = discordProfile.avatar
          ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
          : undefined;
        const result = await registerOrConnectOAuthUser({
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          email: discordProfile.email,
          email_verified: discordProfile.verified || false,
          name: discordProfile.global_name || discordProfile.username,
          image: discordProfile.image_url || image || undefined,
        });
        if (!result.success || !result.user) {
          return false;
        }
        user.id = result.user.id;
        user.role = result.user.role;
        user.email_verified = result.user.email_verified;
        user.is_active = result.user.is_active;
        user.name = result.user.name;
        user.email = result.user.email;
        return true;
      }

      // Credentials 登入不需額外處理
      return user.email ? true : false;
    },
  },

  // ===== 安全性設定 =====
  trustHost: true, // 允許使用 host header（Vercel/雲端平台需要）

  // ===== 自訂頁面 =====
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});

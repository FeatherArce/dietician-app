import prisma from "@/services/prisma";
import { User, UserRole, Prisma } from "@/prisma-generated/postgres-client";
import type { User as NextAuthUser } from "next-auth";
import { PasswordService } from "./auth/password-service";
import { userWithSafetyFields } from "@/types/api/user";

// 類型定義
export type CreateUserData = {
  name: string;
  email: string;
  note?: string;
  role?: UserRole;
  is_active?: boolean;
  password_hash?: string; // 新增：支援認證
  email_verified?: boolean; // 新增：email 驗證狀態
};

export type UpdateUserData = Partial<CreateUserData>;

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  searchName?: string;
  searchEmail?: string;
  emailVerified?: boolean; // 新增
}

export function urlSearchParamsToUserFilters(
  searchParams: URLSearchParams
): UserFilters {
  const filters: UserFilters = {};

  const roleParam = searchParams.get("role");
  if (roleParam && Object.values(UserRole).includes(roleParam as UserRole)) {
    filters.role = roleParam as UserRole;
  }

  const isActiveParam = searchParams.get("is_active");
  if (isActiveParam !== null) {
    filters.isActive = isActiveParam === "true";
  }

  const searchNameParam = searchParams.get("search_name");
  if (searchNameParam) {
    filters.searchName = searchNameParam;
  }

  const searchEmailParam = searchParams.get("search_email");
  if (searchEmailParam) {
    filters.searchEmail = searchEmailParam;
  }

  const emailVerifiedParam = searchParams.get("email_verified");
  if (emailVerifiedParam !== null) {
    filters.emailVerified = emailVerifiedParam === "true";
  }

  return filters;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
}

// User Service
export const userService = {
  // 獲取使用者列表
  async getUsers(filters: UserFilters = {}) {
    try {
      const where: Prisma.UserWhereInput = {
        role: filters.role ? filters.role : undefined,
        is_active: (filters.isActive !== undefined) ? filters.isActive : undefined,
        email_verified: (filters.emailVerified !== undefined) ? filters.emailVerified : undefined,
        name: filters.searchName ? { contains: filters.searchName } : undefined,
        email: filters.searchEmail ? { contains: filters.searchEmail } : undefined,
      };

      const users = await prisma.user.findMany({
        where,
        select: userWithSafetyFields.select,
        orderBy: { created_at: "desc" },
      });

      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  },

  // 獲取單一使用者（包含詳細資訊）
  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          ownedEvents: {
            select: {
              id: true,
              title: true,
              event_date: true,
              is_active: true,
              _count: {
                select: { orders: true },
              },
            },
            orderBy: { created_at: "desc" },
            take: 10, // 最近 10 個事件
          },
          orders: {
            select: {
              id: true,
              total: true,
              created_at: true,
              event: {
                select: {
                  id: true,
                  title: true,
                  event_date: true,
                },
              },
            },
            orderBy: { created_at: "desc" },
            take: 10, // 最近 10 個訂單
          },
          _count: {
            select: {
              ownedEvents: true,
              orders: true,
              joinedEvents: true,
            },
          },
        },
      });
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }
  },

  // 新增使用者
  async createUser(data: CreateUserData) {
    try {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          note: data.note,
          role: data.role || UserRole.USER,
          is_active: data.is_active ?? true,
          password_hash: data.password_hash || "",
          email_verified: data.email_verified ?? false,
          login_count: 0,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          email_verified: true,
          created_at: true,
          last_login: true,
          login_count: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  },

  // 更新使用者
  async updateUser(id: string, data: UpdateUserData) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          updated_at: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  },

  async forceResetPassword(id: string, password: string) {
    try {
      const passwordHash = await PasswordService.hash(password);
      const user = await prisma.user.update({
        where: { id },
        data: { password_hash: passwordHash },
      });
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  },

  // 刪除使用者（軟刪除）
  async deleteUser(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { is_deleted: true },
        select: {
          id: true,
          name: true,
          email: true,
          is_deleted: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw new Error("Failed to deactivate user");
    }
  },

  async restoreUser(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { is_active: true, is_deleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          is_active: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Error restoring user:", error);
      throw new Error("Failed to restore user");
    }
  },

  // 啟用使用者
  async activateUser(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { is_active: true },
        select: {
          id: true,
          name: true,
          email: true,
          is_active: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Error activating user:", error);
      throw new Error("Failed to activate user");
    }
  },

  // 更新使用者角色
  async updateUserRole(id: string, role: UserRole) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Failed to update user role");
    }
  },

  // 獲取使用者統計
  async getUserStats(userId: string) {
    try {
      const [ownedEventsCount, ordersCount, totalSpent, activeEventsCount] =
        await Promise.all([
          // 發起的事件數
          prisma.lunchEvent.count({
            where: { owner_id: userId },
          }),
          // 訂單數
          prisma.lunchOrder.count({
            where: { user_id: userId },
          }),
          // 總消費金額
          prisma.lunchOrder.aggregate({
            where: { user_id: userId },
            _sum: { total: true },
          }),
          // 進行中的事件數
          prisma.lunchEvent.count({
            where: {
              owner_id: userId,
              is_active: true,
              order_deadline: {
                gte: new Date(),
              },
            },
          }),
        ]);

      return {
        ownedEventsCount,
        ordersCount,
        totalSpent: totalSpent._sum.total || 0,
        activeEventsCount,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw new Error("Failed to fetch user stats");
    }
  },

  // ========== 認證相關方法 ==========

  toNextAuthUser(user: User): NextAuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      is_deleted: user.is_deleted || false,
      preferred_theme: user.preferred_theme,
      created_at: user.created_at,
      last_login: user.last_login || undefined,
      login_count: user.login_count,
    };
  },

  // 更新登入資訊
  async updateLoginInfo(userId: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          last_login: new Date(),
          login_count: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error("Error updating login info:", error);
      throw new Error("Failed to update login info");
    }
  },

  // 驗證 email
  async verifyEmail(userId: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          email_verified: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          email_verified: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Error verifying email:", error);
      throw new Error("Failed to verify email");
    }
  },

  // 透過驗證 token 找使用者
  async getUserByVerifyToken(token: string) {
    try {
      // TODO: 需要從 VerificationToken 表中查詢
      return null;
    } catch (error) {
      console.error("Error fetching user by verify token:", error);
      return null;
    }
  },

  // 透過重設 token 找使用者
  async getUserByResetToken(token: string) {
    try {
      // TODO: 需要從 VerificationToken 表中查詢
      return null;
    } catch (error) {
      console.error("Error fetching user by reset token:", error);
      return null;
    }
  },
};

export default userService;

import prisma from '@/services/prisma';
import { User, UserRole, Prisma } from '@/prisma-generated/postgres-client';
import { type PublicUser } from '@/services/server/auth';

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
            const where: Prisma.UserWhereInput = {};
            
            if (filters.role) {
                where.role = filters.role;
            }
            
            if (filters.isActive !== undefined) {
                where.is_active = filters.isActive;
            }
            
            if (filters.searchName) {
                where.name = {
                    contains: filters.searchName
                };
            }
            
            if (filters.searchEmail) {
                where.email = {
                    contains: filters.searchEmail
                };
            }

            if (filters.emailVerified !== undefined) {
                where.email_verified = filters.emailVerified;
            }

            const users = await prisma.user.findMany({
                where,
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
                    _count: {
                        select: {
                            ownedEvents: true,
                            orders: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            });
            
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Failed to fetch users');
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
                                select: { orders: true }
                            }
                        },
                        orderBy: { created_at: 'desc' },
                        take: 10 // 最近 10 個事件
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
                                    event_date: true
                                }
                            }
                        },
                        orderBy: { created_at: 'desc' },
                        take: 10 // 最近 10 個訂單
                    },
                    _count: {
                        select: {
                            ownedEvents: true,
                            orders: true,
                            joinedEvents: true
                        }
                    }
                }
            });
            return user;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw new Error('Failed to fetch user');
        }
    },

    // 根據 email 獲取使用者
    async getUserByEmail(email: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    is_active: true,
                    created_at: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw new Error('Failed to fetch user by email');
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
                    password_hash: data.password_hash || '',
                    email_verified: data.email_verified ?? false,
                    login_count: 0
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
                    login_count: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user');
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
                    updated_at: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user');
        }
    },

    // 刪除使用者（軟刪除，設為不啟用）
    async deactivateUser(id: string) {
        try {
            const user = await prisma.user.update({
                where: { id },
                data: { is_active: false },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    is_active: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw new Error('Failed to deactivate user');
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
                    is_active: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error activating user:', error);
            throw new Error('Failed to activate user');
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
                    role: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error updating user role:', error);
            throw new Error('Failed to update user role');
        }
    },

    // 檢查使用者權限
    async checkUserPermission(userId: string, requiredRole: UserRole): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true, is_active: true }
            });

            if (!user || !user.is_active) {
                return false;
            }

            // 權限層級: ADMIN > MODERATOR > USER
            const roleHierarchy = {
                [UserRole.USER]: 1,
                [UserRole.MODERATOR]: 2,
                [UserRole.ADMIN]: 3
            };

            return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
        } catch (error) {
            console.error('Error checking user permission:', error);
            return false;
        }
    },

    // 檢查使用者是否為事件擁有者
    async isEventOwner(userId: string, eventId: string): Promise<boolean> {
        try {
            const event = await prisma.lunchEvent.findUnique({
                where: { id: eventId },
                select: { owner_id: true }
            });

            return event?.owner_id === userId;
        } catch (error) {
            console.error('Error checking event ownership:', error);
            return false;
        }
    },

    // 檢查使用者是否可以修改訂單
    async canModifyOrder(userId: string, orderId: string): Promise<boolean> {
        try {
            const order = await prisma.lunchOrder.findUnique({
                where: { id: orderId },
                select: { 
                    user_id: true,
                    event: {
                        select: { 
                            owner_id: true,
                            order_deadline: true,
                            is_active: true
                        }
                    }
                }
            });

            if (!order) {
                return false;
            }

            // 檢查是否為訂單擁有者或事件擁有者
            const isOrderOwner = order.user_id === userId;
            const isEventOwner = order.event.owner_id === userId;
            
            if (!isOrderOwner && !isEventOwner) {
                return false;
            }

            // 檢查是否還在期限內
            const isWithinDeadline = new Date() <= order.event.order_deadline;
            const isEventActive = order.event.is_active;

            return isWithinDeadline && isEventActive;
        } catch (error) {
            console.error('Error checking order modification permission:', error);
            return false;
        }
    },

    // 獲取使用者統計
    async getUserStats(userId: string) {
        try {
            const [ownedEventsCount, ordersCount, totalSpent, activeEventsCount] = await Promise.all([
                // 發起的事件數
                prisma.lunchEvent.count({
                    where: { owner_id: userId }
                }),
                // 訂單數
                prisma.lunchOrder.count({
                    where: { user_id: userId }
                }),
                // 總消費金額
                prisma.lunchOrder.aggregate({
                    where: { user_id: userId },
                    _sum: { total: true }
                }),
                // 進行中的事件數
                prisma.lunchEvent.count({
                    where: { 
                        owner_id: userId,
                        is_active: true,
                        order_deadline: {
                            gte: new Date()
                        }
                    }
                })
            ]);

            return {
                ownedEventsCount,
                ordersCount,
                totalSpent: totalSpent._sum.total || 0,
                activeEventsCount
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw new Error('Failed to fetch user stats');
        }
    },

    // 獲取系統統計（僅管理員）
    async getSystemStats() {
        try {
            const [totalUsers, activeUsers, totalEvents, activeEvents, totalOrders, totalRevenue] = await Promise.all([
                // 總使用者數
                prisma.user.count(),
                // 活躍使用者數
                prisma.user.count({
                    where: { is_active: true }
                }),
                // 總事件數
                prisma.lunchEvent.count(),
                // 進行中事件數
                prisma.lunchEvent.count({
                    where: { 
                        is_active: true,
                        order_deadline: {
                            gte: new Date()
                        }
                    }
                }),
                // 總訂單數
                prisma.lunchOrder.count(),
                // 總營收
                prisma.lunchOrder.aggregate({
                    _sum: { total: true }
                })
            ]);

            return {
                totalUsers,
                activeUsers,
                totalEvents,
                activeEvents,
                totalOrders,
                totalRevenue: totalRevenue._sum.total || 0
            };
        } catch (error) {
            console.error('Error fetching system stats:', error);
            throw new Error('Failed to fetch system stats');
        }
    },

    // ========== 認證相關方法 ==========

    // 根據 email 獲取使用者（用於登入）
    async getUserByEmailForAuth(email: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    is_active: true,
                    email_verified: true,
                    password_hash: true, // 登入時需要
                    created_at: true,
                    last_login: true,
                    login_count: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error fetching user by email for auth:', error);
            throw new Error('Failed to fetch user by email for auth');
        }
    },

    // 轉換為公開使用者資料（移除敏感資訊）
    toPublicUser(user: User): PublicUser {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            preferred_theme: user.preferred_theme,
            created_at: user.created_at,
            last_login: user.last_login || undefined,
            login_count: user.login_count
        };
    },

    // 檢查 email 是否可用
    async isEmailAvailable(email: string, excludeUserId?: string) {
        try {
            const where: Prisma.UserWhereInput = { email };
            if (excludeUserId) {
                where.id = { not: excludeUserId };
            }

            const existingUser = await prisma.user.findFirst({ where });
            return !existingUser;
        } catch (error) {
            console.error('Error checking email availability:', error);
            return false;
        }
    },

    // 更新登入資訊
    async updateLoginInfo(userId: string) {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    last_login: new Date(),
                    login_count: {
                        increment: 1
                    }
                }
            });
        } catch (error) {
            console.error('Error updating login info:', error);
            throw new Error('Failed to update login info');
        }
    },

    // 驗證 email
    async verifyEmail(userId: string) {
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    email_verified: true,
                    email_verify_token: null
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    email_verified: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error verifying email:', error);
            throw new Error('Failed to verify email');
        }
    },

    // 透過驗證 token 找使用者
    async getUserByVerifyToken(token: string) {
        try {
            const user = await prisma.user.findFirst({
                where: { email_verify_token: token },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    email_verified: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error fetching user by verify token:', error);
            return null;
        }
    },

    // 透過重設 token 找使用者
    async getUserByResetToken(token: string) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    reset_token: token,
                    reset_token_expires: {
                        gt: new Date()
                    }
                },
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            });
            return user;
        } catch (error) {
            console.error('Error fetching user by reset token:', error);
            return null;
        }
    }
};

export default userService;
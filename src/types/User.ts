import { UserRole } from "@/prisma-generated/postgres-client";

export function getUserRoleLabel(role: UserRole): string {
    switch (role) {
        case UserRole.ADMIN:
            return '系統管理員';
        case UserRole.MODERATOR:
            return '管理者';
        case UserRole.USER:
            return '一般用戶';
        case UserRole.GUEST:
            return '訪客';
        default:
            return `未知角色 (${role})`;
    }
}

export interface PublicUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    is_deleted: boolean;
    preferred_theme: string;
    created_at: Date;
    last_login?: Date;
    login_count: number;
}

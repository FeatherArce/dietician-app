import { UserRole } from "@/prisma-generated/postgres-client";

export function getUserRoleLabel(role: UserRole): string {
    switch (role) {
        case UserRole.ADMIN:
            return '系統管理員';
        case UserRole.MODERATOR:
            return '管理者';
        case UserRole.USER:
            return '一般用戶';
        default:
            return `未知角色 (${role})`;
    }
}
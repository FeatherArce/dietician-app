import { Prisma, User, Account } from "@/prisma-generated/postgres-client";
import { ApiResponse } from "./api";

export const userWithSafetyFields = Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        is_deleted: true,
        email_verified: true,
        created_at: true,
        last_login: true,
        login_count: true,
        _count: {
            select: {
                ownedEvents: true,
                orders: true,
            },
        },
    }
});
export type UserWithSafetyFields = Prisma.UserGetPayload<typeof userWithSafetyFields>;

export type GetUsersResponse = ApiResponse<{ users: UserWithSafetyFields[] }>;

export type GetUserAccountsResponse = ApiResponse<{ accounts: Account[] }>;
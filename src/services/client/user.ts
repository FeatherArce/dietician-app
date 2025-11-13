import { User } from "@/prisma-generated/postgres-client";
import { authFetch } from "@/libs/auth-fetch";

const userApiBase = '/api/users';

export async function getUsers(filters: Record<string, any> = {}) { 
    const response = await authFetch(userApiBase);
    const result = await response.json();
    return { response, result };
}

/**
 * 建立使用者。
 * 註冊應使用 auth.ts 裡的 register 函式
 */
export async function createUser(data: Partial<User>) { 
    const response = await authFetch(userApiBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return { response, result };
}

export async function getUserById(userId: string) { 
    const response = await authFetch(`${userApiBase}/${userId}`);
    const result = await response.json();
    return { response, result };
}

export async function updateUser(userId: string, data: Partial<User>) {
    const response = await authFetch(`${userApiBase}/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    return { response, result };
}

export async function logicalDeleteUser(userId: string) {
    const response = await authFetch(`${userApiBase}/${userId}`, {
        method: 'DELETE',
    });
    const result = await response.json();
    return { response, result };
}


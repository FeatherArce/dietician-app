import { User } from "@/prisma-generated/postgres-client";
import { authFetch } from "@/libs/auth-fetch";

export async function updateUser(userId: string, data: Partial<User>) {
    const response = await authFetch(`/api/users/${userId}`, {
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
    const response = await authFetch(`/api/users/${userId}`, {
        method: 'DELETE',
    });
    const result = await response.json();
    return { response, result };
}
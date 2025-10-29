import { User } from "@/app/lunch/types";
import { authFetch } from "@/libs/auth-fetch";

export async function UpdateUser(userId: string, data: Partial<User>) {
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
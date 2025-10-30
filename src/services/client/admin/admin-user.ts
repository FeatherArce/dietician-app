import { authFetch } from "@/libs/auth-fetch";

export async function deleteUser(userId: string) {
    const response = await authFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
    });
    const result = await response.json();
    return { response, result };
}
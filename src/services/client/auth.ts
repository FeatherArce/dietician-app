import { User, UserRole } from "@/prisma-generated/postgres-client";

interface RegisterUser {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: UserRole;
}

export async function register(data: RegisterUser) {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    return { response, result };
}
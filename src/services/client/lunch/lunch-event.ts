import { LunchEvent } from "@/prisma-generated/postgres-client";

export async function createLunchEvent(data: Partial<LunchEvent>) {
    const response = await fetch('/api/lunch/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    return { response, result };
}
import { authFetch } from "@/libs/auth-fetch";
import { LunchEvent } from "@/prisma-generated/postgres-client";


const eventsPath = '/api/lunch/events';

export async function getLunchEvents() {
     const response = await authFetch(eventsPath);
     const result = await response.json();
     return { response, result };
}

export async function createLunchEvent(data: Partial<LunchEvent>) {
    const response = await authFetch('/api/lunch/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    return { response, result };
}

export async function getLunchEventById(eventId: string) {
    const response = await authFetch(`${eventsPath}/${eventId}`);
    const result = await response.json();
    return { response, result };
}

export async function getLunchEventOrders(eventId: string) {
    const response = await authFetch(`${eventsPath}/${eventId}/orders`);
    const result = await response.json();
    return { response, result };
}


import { authFetch } from "@/libs/auth-fetch";
import { LunchEvent } from "@/prisma-generated/postgres-client";
import { GetEventResponse } from "@/types/api/lunch";

const eventsPath = '/api/lunch/events';

export async function getLunchEvents() {
    const response = await authFetch(eventsPath);
    const result = await response.json();
    return { response, result };
}

export async function createLunchEvent(data: Partial<LunchEvent>) {
    const response = await authFetch(eventsPath, {
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
    const result: GetEventResponse = await response.json();
    return { response, result };
}

export async function updateLunchEvent(eventId: string, data: Partial<LunchEvent>) {
    const response = await authFetch(`${eventsPath}/${eventId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return { response, result };
}

export async function getLunchEventOrders(eventId: string) {
    const response = await authFetch(`${eventsPath}/${eventId}/orders`);
    const result = await response.json();
    return { response, result };
}


import { API_CONSTANTS } from "@/constants/app-constants";
import { fetcher } from '@/libs/swr-fetcher';
import { removedUndefinedFields } from "@/libs/utils";
import { LunchEventFilters } from "@/services/lunch";
import { GetEventResponse, GetEventsResponse } from "@/types/api/lunch";
import useSWR from 'swr';

const lunchEventsPath = API_CONSTANTS.LUNCH_EVENTS_ENDPOINT;

export function useLunchEvents(filters?: LunchEventFilters) {
    const query = removedUndefinedFields(filters);
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const { data, error, isLoading, mutate } = useSWR<GetEventsResponse>(
        queryString ? `${lunchEventsPath}?${queryString}` : lunchEventsPath,
        fetcher
    );
    return {
        lunchEvents: data?.data?.events || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useLunchEvent(eventId: string) {
    const { data, error, isLoading, mutate } = useSWR<GetEventResponse>(
        eventId ? `${lunchEventsPath}/${eventId}` : null,
        fetcher
    );
    return {
        lunchEvent: data?.data?.event || null,
        isLoading,
        isError: error,
        mutate
    };
}

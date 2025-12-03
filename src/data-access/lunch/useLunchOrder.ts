import { API_CONSTANTS } from "@/constants/app-constants";
import { fetcher } from '@/libs/swr-fetcher';
import { removedUndefinedFields } from "@/libs/utils";
import { LunchOrderFilters } from "@/services/lunch";
import { GetLunchOrdersResponse } from "@/types/api/lunch";
import useSWR from 'swr';

const lunchOrderPath = API_CONSTANTS.LUNCH_ORDERS_ENDPOINT;

export function useLunchOrders(filters?: LunchOrderFilters) {
    const query = removedUndefinedFields(filters);
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const { data, error, isLoading, mutate } = useSWR<GetLunchOrdersResponse>(
        `${lunchOrderPath}${queryString ? `?${queryString}` : ''}`,
        fetcher
    );
    return {
        lunchOrders: data?.data?.orders || [],
        isLoading,
        isError: error,
        mutate
    };
}
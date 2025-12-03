import { fetcher } from '@/libs/swr-fetcher';
import useSWR from 'swr';
import { GetShopMenuItemsResponse, GetShopResponse, GetShopsResponse } from "@/types/api/lunch";
import { removedUndefinedFields } from '@/libs/utils';
import { ShopFilters } from '@/services/lunch';
import { API_CONSTANTS } from '@/constants/app-constants';

const shopsPath = API_CONSTANTS.LUNCH_SHOPS_ENDPOINT;
// const menusPath = /api/lunch/shops/[id]/menus/[id or default]/items';

export function useLunchShops(filters?: ShopFilters) {
    const query = removedUndefinedFields(filters);
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const { data, error, isLoading, mutate } = useSWR<GetShopsResponse>(
        queryString ? `${shopsPath}?${queryString}` : shopsPath,
        fetcher
    );
    return {
        shops: data?.data?.shops || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useLunchShop(shopId: string) {
    const { data, error, isLoading, mutate } = useSWR<GetShopResponse>(
        shopId ? `${shopsPath}/${shopId}` : null,
        fetcher
    );
    return {
        shop: data?.data?.shop || null,
        isLoading,
        isError: error,
        mutate
    };
}

export function useLunchShopMenuItems(shopId: string, menuId: string) {
    // const response = await authFetch(`${menuPath}/${menuId}/items`);
    const { data, error, isLoading, mutate } = useSWR<GetShopMenuItemsResponse>(
        shopId ? `${shopsPath}/${shopId}/menus/${menuId}/items` : null,
        fetcher
    );
    // console.log('useLunchShopMenuItems data:', data);
    return {
        menuItems: data?.data?.items || [],
        isLoading,
        isError: error,
        mutate
    };
}
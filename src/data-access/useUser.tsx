import { fetcher } from '@/libs/swr-fetcher';
import { GetUserResponse, GetUsersResponse } from '@/types/api/user';
import useSWR from 'swr';

const userApiBase = '/api/users';

export function useUsers() {
    const { data, error, isLoading, mutate } = useSWR<GetUsersResponse>(userApiBase, fetcher);
    console.log('useUsers', { data, error, isLoading });
    return {
        users: data?.data?.users || [],
        isLoading,
        isError: error,
        mutate: mutate
    }
}

export function useUser(uid: string) {
    const { data, error, isLoading } = useSWR<GetUserResponse>([userApiBase, uid], async () => {
        return fetcher(`${userApiBase}/${uid}`);
    })
    console.log('useUser', data, error, isLoading);
    return {
        user: data,
        isLoading,
        isError: error
    }
}
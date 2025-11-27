import { GetUserResponse, GetUsersResponse, UserWithSafetyFields } from '@/types/api/user';
import useSWR, { KeyedMutator } from 'swr';
import { fetcher } from '@/libs/swr-fetcher';

const userApiBase = '/api/users';

export function useUsers(): {
    users: UserWithSafetyFields[];
    isLoading: boolean;
    isError: any;
    mutate: KeyedMutator<GetUsersResponse>;
} {
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
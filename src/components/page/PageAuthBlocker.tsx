import { ROUTE_CONSTANTS } from '@/constants/app-constants';
import Link from 'next/link';
import React from 'react'

export default function PageAuthBlocker({
    title = '請先登入',
    description = '您需要登入才能參與訂餐',
    buttonText = '前往登入',
    loading = false,
}) {
    // const { data: session, status } = useSession();

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="mb-4">{description}</p>
                <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-primary">
                    {buttonText}
                </Link>
            </div>
        </div>
    );

}

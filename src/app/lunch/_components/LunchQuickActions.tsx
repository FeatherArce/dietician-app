"use client";
import { UserRole } from '@/prisma-generated/postgres-client';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import {
    FaCalendarAlt,
    FaStore,
    FaUsers
} from 'react-icons/fa';

export default function LunchQuickActions() {
    const { user } = useAuthStore();

    if(!user) {
        return null;
    }

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                🛠️ 管理功能
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-200">
                {user?.role === UserRole.ADMIN && (<>
                    <li>
                        <Link href="/users" className="flex items-center space-x-2">
                            <FaUsers className="w-4 h-4" />
                            <span>用戶管理</span>
                        </Link>
                    </li>
                </>)}
                <li>
                    <Link href="/lunch/events" className="flex items-center space-x-2">
                        <FaCalendarAlt className="w-4 h-4" />
                        <span>活動管理</span>
                    </Link>
                </li>
                {(user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR) && (
                    <>
                        <li>
                            <Link href="/lunch/shops" className="flex items-center space-x-2">
                                <FaStore className="w-4 h-4" />
                                <span>商店管理</span>
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </div>
    );
}
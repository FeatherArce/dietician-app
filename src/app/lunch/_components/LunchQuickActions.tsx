"use client";
import { MenuItem, NavbarMenu } from '@/components/Navbar';
import { UserRole } from '@/prisma-generated/postgres-client';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { useMemo } from 'react';
import {
    FaCalendarAlt,
    FaStore,
    FaUsers
} from 'react-icons/fa';

export default function LunchQuickActions() {
    const { data: session, status } = useSession();
    const authLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';
    const user = session?.user;

    const menuItems: Array<MenuItem> = useMemo(() => {
        const newItems: Array<MenuItem> = [];
        newItems.push({ label: "訂餐系統", href: "/lunch", icon: <FaStore className='w-4 h-4' /> });
        newItems.push({ label: "活動管理", href: "/lunch/events", icon: <FaCalendarAlt className='w-4 h-4' /> });
        if (user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR) {
            newItems.push({ label: "商店管理", href: "/lunch/shops", icon: <FaStore className='w-4 h-4' /> });
        }
        return newItems;
    }, [user?.role]);

    if (!user) {
        return null;
    }

    return (
        <div>
            <div className='hidden md:block'>
                <NavbarMenu device="desktop" items={menuItems} />
            </div>
            <div className='flex justify-end md:hidden'>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                        🛠️ 管理功能
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <NavbarMenu device="mobile" items={menuItems} />
                </div>
            </div>
        </div>
    );
}
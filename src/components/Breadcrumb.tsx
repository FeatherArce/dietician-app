"use client";

import { APP_NAME, AUTH_CONSTANTS, ROUTE_CONSTANTS } from '@/constants/app-constants';
import Link from 'next/link';
import { FaHome, FaUser } from 'react-icons/fa';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

export const appBreadcrumbHomeItem: BreadcrumbItem = {
  label: APP_NAME,
  href: AUTH_CONSTANTS.DEFAULT_REDIRECT_AFTER_LOGIN,
  icon: <FaHome />
};

export const lunchBreadcrumbHomeItem: BreadcrumbItem = {
  label: '訂餐系統',
  href: ROUTE_CONSTANTS.LUNCH,
  icon: <FaHome />
};

export const usersBreadcrumbHomeItem: BreadcrumbItem = {
  label: '使用者管理',
  href: ROUTE_CONSTANTS.USERS,
  icon: <FaUser />
};

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {

  const renderItem = (item: BreadcrumbItem) => {
    if (item.href && !item.current) {
      return (
        <Link
          href={item.href}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
        >
          {item.icon ? item.icon : null}
          {item.label}
        </Link>
      );
    }
    return (
      <span className={`${item.current ? 'text-primary font-medium' : 'text-gray-500'}`}>
        {item.label}
      </span>
    );
  };

  return (
    <div className={`breadcrumbs max-w-screen text-sm mb-6 ${className || ''}`} {...props}>
      <ul>
        {/* 動態項目 */}
        {items.map((item, index) => (
          <li key={index}>
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}
"use client";

import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface BreadcrumbProps {
  homeItem?: BreadcrumbItem;
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ homeItem, items }: BreadcrumbProps) {

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
    <div className="breadcrumbs text-sm mb-6">
      <ul>
        {/* 首頁 */}
        <li>
          {renderItem(homeItem || { label: '午餐系統', href: '/lunch', icon: <FaHome /> })}
        </li>

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
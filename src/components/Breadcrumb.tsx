"use client";

import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="breadcrumbs text-sm mb-6">
      <ul>
        {/* 首頁 */}
        <li>
          <Link 
            href="/lunch" 
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <FaHome className="h-4 w-4" />
            午餐系統
          </Link>
        </li>
        
        {/* 動態項目 */}
        {items.map((item, index) => (
          <li key={index}>
            {item.href && !item.current ? (
              <Link 
                href={item.href}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`${item.current ? 'text-primary font-medium' : 'text-gray-500'}`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
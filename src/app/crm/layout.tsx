"use client";
import React from "react";
import Link from "next/link";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-base-200">
      <aside className="w-64 bg-base-200 border-r border-base-300 flex flex-col py-6 px-4">
        <h2 className="text-lg font-semibold mb-8 tracking-tight text-base-content">CRM 功能選單</h2>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li><Link href="/" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-primary-content transition">🏠 回到首頁</Link></li>
            <li><Link href="/crm/customer" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-primary-content transition">客戶管理</Link></li>
            <li><Link href="/crm/contact" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-primary-content transition">聯絡管理</Link></li>
            <li><Link href="/crm/sales" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-primary-content transition">銷售管理</Link></li>
            <li><Link href="/crm/activity" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-primary-content transition">活動與任務</Link></li>
            <li><Link href="/crm/service" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-primary-content transition">客戶服務</Link></li>
            <li><Link href="/crm/report" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-primary-content transition">分析與報表</Link></li>
            <li><Link href="/crm/setting" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-primary-content transition">系統設定</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-10 bg-base-100">
        {children}
      </main>
    </div>
  );
}

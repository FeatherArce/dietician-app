"use client";
import React from "react";
import Link from "next/link";

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-base-200">
      <aside className="w-64 bg-base-200 border-r border-base-300 flex flex-col py-6 px-4">
        <h2 className="text-lg font-semibold mb-8 tracking-tight text-base-content">ERP 功能選單</h2>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li><Link href="/" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-secondary-content transition">🏠 回到首頁</Link></li>
            <li><Link href="/erp/hr" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-secondary-content transition">人力資源管理</Link></li>
            <li><Link href="/erp/finance" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-secondary-content transition">財務管理</Link></li>
            <li><Link href="/erp/purchase" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-secondary-content transition">採購管理</Link></li>
            <li><Link href="/erp/inventory" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-secondary-content transition">庫存與物流</Link></li>
            <li><Link href="/erp/production" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-secondary-content transition">生產管理</Link></li>
            <li><Link href="/erp/admin" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-secondary-content transition">行政管理</Link></li>
            <li><Link href="/erp/report" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-secondary-content transition">分析與報表</Link></li>
            <li><Link href="/erp/setting" className="block rounded-md px-3 py-2 text-base-content hover:bg-base-300 hover:text-secondary-content transition">系統設定</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-10 bg-base-100">
        {children}
      </main>
    </div>
  );
}

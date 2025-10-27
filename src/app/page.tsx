import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-base-200 flex items-center justify-center">
      <div className="container mx-auto max-w-xl">
        <h1 className="text-4xl font-bold mb-8 text-center">訂餐管理系統</h1>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          {/* 暫時註解其他系統 */}
          {/* <Link
            href="/crm"
            className="card bg-base-100 shadow-xl hover:bg-primary hover:text-primary-content transition cursor-pointer"
          >
            <div className="card-body items-center">
              <h2 className="card-title">CRM 系統</h2>
              <p>客戶關係管理</p>
            </div>
          </Link>
          <Link
            href="/erp"
            className="card bg-base-100 shadow-xl hover:bg-secondary hover:text-secondary-content transition cursor-pointer"
          >
            <div className="card-body items-center">
              <h2 className="card-title">ERP 系統</h2>
              <p>企業資源規劃</p>
            </div>
          </Link> */}
          <Link 
            href="/lunch" 
            className="card bg-base-100 shadow-xl hover:bg-accent hover:text-accent-content transition cursor-pointer"
          >
            <div className="card-body items-center">
              <h2 className="card-title">訂餐系統</h2>
              <p>團體訂餐管理</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

"use client";
import React from "react";
import LunchQuickActions from './_components/LunchQuickActions';

export default function LunchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-base-200 min-h-screen">
      <main className="grid grid-rows-[auto_1fr] gap-2 p-2 md:py-4 bg-base-100 min-h-screen">
        {/* 管理員功能區域 */}
        <div className="flex justify-end">
          <LunchQuickActions />
        </div>
        
        {children}
      </main>
    </div>
  );
}

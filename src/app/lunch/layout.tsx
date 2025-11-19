"use client";
import React from "react";
import LunchQuickActions from './_components/LunchQuickActions';

export default function LunchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-base-200 min-h-screen w-full">
      <main className="grid grid-rows-[auto_1fr] gap-2 p-2 bg-base-100 h-full w-full min-w-0">
        <LunchQuickActions />
        {children}
      </main>
    </div>
  );
}

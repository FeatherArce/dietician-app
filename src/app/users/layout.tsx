"use client";
import React from "react";

export default function LunchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-base-200 grid grid-rows-[auto_1fr] w-full h-full min-w-0">
      <main className="space-y-2 p-2 pt-4 bg-base-100 h-full w-full min-w-0">
        {children}
      </main>
    </div>
  );
}

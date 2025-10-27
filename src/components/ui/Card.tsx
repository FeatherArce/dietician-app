"use client";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = "", title, subtitle }: CardProps) {
  return (
    <div className="bg-base-200 flex items-center justify-center py-8">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className={`card-body ${className}`}>
          {title && (
            <h2 className="card-title justify-center text-2xl mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-center text-base-content/70 mb-6">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
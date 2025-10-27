"use client";
import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // 在應用程式啟動時初始化認證狀態
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
"use client";
// 重新導出 auth store，保持向後相容性
export { 
  useAuth, 
  useAuthUser, 
  useAuthLoading, 
  useAuthStatus,
  useAuthStore 
} from "@/stores/auth-store";

// 重新導出 AuthProvider
export { AuthProvider } from "@/components/AuthProvider";
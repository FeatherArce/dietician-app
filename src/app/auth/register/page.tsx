"use client";
import { Notification } from "@/components/Notification";
import { useAuth } from "@/hooks/useAuth";
import { register } from "@/services/client/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import RegisterForm from "./RegisterForm";
import { toast } from "@/components/Toast";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // 檢查使用者是否已登入，如果是則重定向
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('[REGISTER PAGE] User is authenticated, redirecting...');
      toast.info("您已登入，正在跳轉...");
      router.push("/lunch");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleFinish = useCallback(async (values: any) => {
    setIsLoading(true);
    try {
      const res = await register(values);
      const result = res.result;
      console.log("Register response:", { response: res, result });

      if (res.response.ok) {
        console.log("Registration successful:");
        toast.success("註冊成功！正在為您登入...");

        // 註冊成功，使用 Zustand store 儲存登入狀態
        if (result.user && result.token) {
          login(result.user, result.token);
          console.log("Login state updated with:", { user: result.user.email, hasToken: !!result.token });
          
          // 重定向到主頁
          router.push("/lunch");
        } else {
          console.error("Registration succeeded but missing user or token:", { 
            hasUser: !!result.user, 
            hasToken: !!result.token 
          });
          toast.error("註冊成功但登入失敗，請手動登入");
          router.push("/auth/login");
        }
      } else {
        console.log("Register failed:", { result });
        toast.error(`註冊失敗: ${result.error || result.message || "請檢查輸入資料是否正確"}`);
        if (result.errors && Array.isArray(result.errors)) {
          setErrors(result.errors);
        } else {
          setErrors([result.error || result.message || "註冊失敗"]);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      Notification.error({ title: "註冊失敗", message: error instanceof Error ? error.message : "請稍後再試" });
    } finally {
      setIsLoading(false);
    }
  }, [login, router]);

  // 如果正在檢查認證狀態或已登入，顯示載入狀態
  if (authLoading || isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">檢查登入狀態中...</span>
      </div>
    );
  }

  return (
    <div className="bg-base-200 flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl p-8">
        <h2 className="card-title justify-center text-2xl mb-2">
          註冊帳號
        </h2>
        <p className="text-center text-base-content/70 mb-6">
          建立您的新帳號
        </p>
        {/* {errors.length > 0 && (
          <div className="alert alert-error mb-4">
            <div>{errors.join(", ")}</div>
          </div>
        )} */}
        <RegisterForm
          isLoading={isLoading}
          onFinish={handleFinish}
        />

        <div className="divider">或</div>

        <div className="text-center space-y-2">
          <p className="text-sm">
            已經有帳號了？
            <Link href={ROUTE_CONSTANTS.LOGIN} className="link link-primary ml-1">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
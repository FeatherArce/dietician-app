"use client";
import { Notification } from "@/components/Notification";
import { useAuth } from "@/hooks/useAuth";
import { register } from "@/services/client/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import RegisterForm from "./RegisterForm";
import { toast } from "@/components/Toast";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const { login } = useAuth();

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
        login(result.user, result.token);

        // 重定向到主頁
        router.push("/lunch");
      } else {
        console.log("Register failed:", { result });
        toast.error("註冊失敗，請檢查輸入資料");
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

  return (
    <div className="bg-base-200 flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl p-8">
        <h2 className="card-title justify-center text-2xl mb-2">
          註冊帳號
        </h2>
        <p className="text-center text-base-content/70 mb-6">
          建立您的新帳號
        </p>

        <RegisterForm
          isLoading={isLoading}
          onFinish={handleFinish}
        />

        <div className="divider">或</div>

        <div className="text-center space-y-2">
          <p className="text-sm">
            已經有帳號了？
            <Link href="/auth/login" className="link link-primary ml-1">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
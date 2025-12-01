"use client";
import { Notification } from "@/components/Notification";
import { register } from "@/data-access/auth";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import RegisterForm from "./RegisterForm";
import { toast } from "@/components/Toast";
import { AUTH_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app-constants";
import { useSession } from "next-auth/react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const authLoading = status === "loading";

  // 檢查使用者是否已登入，如果是則重定向
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/lunch");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleFinish = useCallback(async (values: any) => {
    setIsLoading(true);
    try {
      // 第 1 步：呼叫註冊 API
      const res = await register(values);
      const result = res.result;
      console.log("Register response:", { response: res, result });

      if (!res.response.ok) {
        console.log("Register failed:", res);
        toast.error(`註冊失敗: ${result.error || result.message || "請檢查輸入資料是否正確"}`);
        if (result.errors && Array.isArray(result.errors)) {
          setErrors(result.errors);
        } else {
          setErrors([result.error || result.message || "註冊失敗"]);
        }
      }

      toast.success("註冊成功！正在為您登入...");

      // 第 2 步：註冊成功後，立即呼叫 signIn() 自動登入
      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false  // 先不重定向，讓我們手動控制
      });

      if (signInResult?.ok) {
        // 登入成功後重定向
        router.push("/lunch");
      } else {
        console.error("Auto-signin failed:", signInResult?.error);
        toast.error("登入失敗，請手動登入");
        router.push(AUTH_CONSTANTS.LOGIN_REDIRECT);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(`註冊失敗: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

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
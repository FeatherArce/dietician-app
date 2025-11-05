"use client";
import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormCard, FormField, FormErrors } from "@/components/form";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import { toast } from "@/components/Toast";
import { Form2, Input } from "@/components/form2";
import PasswordInput from "@/components/form2/controls/PasswordInput";
import { Card } from "@/components/ui/Card";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const redirectToPage = useCallback(() => {
    // 登入成功，重定向到主頁或指定頁面
    const redirectTo = new URLSearchParams(window.location.search).get("redirect");
    if (redirectTo === ROUTE_CONSTANTS.LOGIN || !redirectTo) {
      router.push("/lunch");
      return;
    }
    router.push(redirectTo);
  }, [router]);

  // 檢查使用者是否已登入，如果是則重定向
  useEffect(() => {
    // 確保認證狀態載入完成，且使用者已登入時才重定向
    if (!authLoading && isAuthenticated) {
      console.log('[LOGIN PAGE] User is authenticated, redirecting...');
      toast.info("您已登入，正在跳轉...");
      redirectToPage();
    }
  }, [authLoading, isAuthenticated, redirectToPage]);

  const updateErrorMessage = useCallback((msg: string) => {
    setErrors([msg]);
    toast.error(msg);
  }, []);

  const handleFinish = useCallback(async (values: any) => {
    setIsLoading(true);
    setErrors([]);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        // 使用 Zustand store 儲存登入狀態
        if (result.user && result.token) {
          login(result.user, result.token);
        }
        toast.success("登入成功，即將跳轉頁面");
        // 登入成功後的導向
        redirectToPage();
      } else {
        toast.error(result.error || result.message || "登入失敗");
        setErrors([result.error || result.message || "登入失敗"]);
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg = error instanceof Error ? error.message : "登入失敗";
      toast.error(msg);
      setErrors([msg]);
    } finally {
      setIsLoading(false);
    }
  }, [login, redirectToPage]);


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
    <Card>
      <h2 className="card-title justify-center text-2xl mb-2">
        登入
      </h2>

      <FormErrors errors={errors} />

      <Form2 onFinish={handleFinish}>
        <Form2.Item
          label="Email"
          name='email'
          rules={[{
            required: true,
            validator(value, values) {
              const emailRegex = /\S+@\S+\.\S+/;
              const email = value as string;
              if (!email || !emailRegex.test(email)) {
                return '請輸入有效的 Email 格式';
              }
              return '';
            },
          }]}
        >
          <Input type="email" placeholder="請輸入 Email" required autoComplete="email" />
        </Form2.Item>
        <Form2.Item
          label="密碼"
          name='password'
          rules={[{ required: true }]}
        >
          <PasswordInput
            type="password"
            placeholder="請輸入密碼"
            required
            autoComplete="current-password"
            showPasswordToggle={true}
          />
        </Form2.Item>
        <Form2.Button.Container>
          <Form2.Button type="submit" loading={isLoading} className="btn-primary w-full mt-6">
            登入
          </Form2.Button>
        </Form2.Button.Container>
      </Form2>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="divider">或</div>

        <div className="w-full flex flex-col gap-2">
          {/* Google */}
          <button className="btn dark:btn-neutral">
            <FcGoogle className="size-[1.2em]" size={20} />
            Login with Google
          </button>
        </div>

        <p className="text-sm mt-4">
          還沒有帳號？
          <Link href="/auth/register" className="link link-primary ml-1">
            立即註冊
          </Link>
        </p>
      </div>
    </Card>
  );
}
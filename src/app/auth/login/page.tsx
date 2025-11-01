"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormCard, FormField, FormErrors } from "@/components/form";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import { toast } from "@/components/Toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const { login } = useAuth();

  const redirectToPage = useCallback(() => {
    // 登入成功，重定向到主頁或指定頁面
    const redirectTo = new URLSearchParams(window.location.search).get("redirect");
    if (redirectTo === ROUTE_CONSTANTS.LOGIN || !redirectTo) {
      router.push("/lunch");
      return;
    }
    router.push(redirectTo);
  }, [router]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors([]);

    const formData = new FormData(event.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      rememberMe: formData.get("rememberMe") === "on",
    };

    // 前端基本驗證
    const validationErrors: string[] = [];

    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      validationErrors.push("請輸入有效的 Email 格式");
    }

    if (!data.password) {
      validationErrors.push("請輸入密碼");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
      toast.error("網路錯誤，請稍後再試");
      setErrors(["網路錯誤，請稍後再試"]);
    } finally {
      setIsLoading(false);
    }
  }, [login, redirectToPage]);

  return (
    <FormCard
      title="登入"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText="登入"
      footer={
        <p className="text-sm">
          還沒有帳號？
          <Link href="/auth/register" className="link link-primary ml-1">
            立即註冊
          </Link>
        </p>
      }
    >
      <FormErrors errors={errors} />

      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="請輸入 Email"
        required
        autoComplete="email"
      />

      <FormField
        label="密碼"
        name="password"
        type="password"
        placeholder="請輸入密碼"
        required
        autoComplete="current-password"
        showPasswordToggle={true}
      />

      {/* Remember Me 功能暫時註解掉
      <div className="form-control">
        <label className="label cursor-pointer">
          <input
            type="checkbox"
            name="rememberMe"
            className="checkbox checkbox-primary"
          />
          <span className="label-text">記住我</span>
        </label>
      </div>
      */}
    </FormCard>
  );
}
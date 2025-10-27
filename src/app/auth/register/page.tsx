"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormCard, FormField, FormErrors } from "@/components/form";
import { useAuth } from "@/hooks/useAuth";
import RegisterForm from "./RegisterForm";
import { Notification } from "@/components/Notification";
import { register } from "@/services/client/auth";

function RegisterPageOld() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors([]);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    // 前端基本驗證
    const validationErrors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
      validationErrors.push("姓名至少需要 2 個字元");
    }

    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      validationErrors.push("請輸入有效的 Email 格式");
    }

    if (!data.password || data.password.length < 8) {
      validationErrors.push("密碼至少需要 8 個字元");
    }

    if (data.password !== data.confirmPassword) {
      validationErrors.push("密碼確認不一致");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Register response:", { response, result });

      if (response.ok || result.success) {
        // 註冊成功，使用 Zustand store 儲存登入狀態
        login(result.user, result.token);

        // 重定向到主頁
        router.push("/lunch");
      } else {
        console.log("Register failed:", { result });
        if (result.errors && Array.isArray(result.errors)) {
          setErrors(result.errors);
        } else {
          setErrors([result.error || result.message || "註冊失敗"]);
        }
      }
    } catch {
      setErrors(["網路錯誤，請稍後再試"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormCard
      title="註冊帳號"
      subtitle="建立您的新帳號"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText="註冊"
      footer={
        <p className="text-sm">
          已經有帳號了？
          <Link href="/auth/login" className="link link-primary ml-1">
            立即登入
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
        helpText="將用於登入帳號"
      />

      <FormField
        label="姓名"
        name="name"
        type="text"
        placeholder="請輸入您的姓名"
        required
        minLength={2}
        maxLength={100}
      />

      <FormField
        label="密碼"
        name="password"
        type="password"
        placeholder="請輸入密碼"
        required
        autoComplete="new-password"
        minLength={8}
        maxLength={100}
        showPasswordToggle={true}
        helpText="至少 8 個字元"
      />

      <FormField
        label="確認密碼"
        name="confirmPassword"
        type="password"
        placeholder="請再次輸入密碼"
        required
        autoComplete="new-password"
        minLength={8}
        maxLength={100}
        showPasswordToggle={true}
      />
    </FormCard>
  );
}

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
        // 註冊成功，使用 Zustand store 儲存登入狀態
        login(result.user, result.token);

        // 重定向到主頁
        router.push("/lunch");
      } else {
        console.log("Register failed:", { result });
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
  }, []);

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
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
import { FaDiscord } from "react-icons/fa";
import PageAuthBlocker from "@/components/page/PageAuthBlocker";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { login, logout, isAuthenticated, isLoading: authLoading } = useAuth();

  const redirectToPage = useCallback(() => {
    // 登入成功，重定向到主頁或指定頁面
    const redirectTo = new URLSearchParams(window.location.search).get("redirect");
    if (redirectTo === ROUTE_CONSTANTS.LOGIN || !redirectTo) {
      router.push("/lunch");
    } else {
      router.push(redirectTo);
    }
  }, [router]);

  // 檢查使用者是否已登入，如果是則重定向
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('[LOGIN PAGE] Auth status:', {
        authLoading,
        isAuthenticated
      });

      if (authLoading) {
        // 還在載入中，等待
        return;
      }

      if (isAuthenticated) {
        // 前端認為已登入，但需要驗證是否真的有效
        try {
          console.log('[LOGIN PAGE] Checking cookie availability...');
          console.log('[LOGIN PAGE] document.cookie:', document.cookie);

          const response = await fetch('/api/auth/me', {
            credentials: 'include', // 確保包含 cookies
          });

          console.log('[LOGIN PAGE] /api/auth/me response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('[LOGIN PAGE] User is authenticated, user:', data.user?.email);
            // 真的已登入，執行重定向
            console.log('[LOGIN PAGE] User is authenticated, redirecting...');
            toast.info("您已登入，正在跳轉...");
            redirectToPage();
          } else {
            // 認證失敗，強制登出
            const errorData = await response.json();
            console.log('[LOGIN PAGE] Auth verification failed, error:', errorData);
            toast.warning("登入狀態已過期，請重新登入");
            logout();
          }
        } catch (error) {
          // 網路錯誤或其他問題，強制登出
          console.error('[LOGIN PAGE] Auth check error:', error);
          toast.warning("登入狀態驗證失敗，請重新登入");
          logout();
        }
      } else {
        // 前端認為未登入，檢查是否有殘留的認證資料需要清除
        const hasLocalToken = localStorage.getItem('auth-token');
        if (hasLocalToken) {
          console.log('[LOGIN PAGE] Found stale local auth data, cleaning up');
          localStorage.removeItem('auth-token');
        }
      }

      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [authLoading, isAuthenticated, redirectToPage, logout]);

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
          // 登入成功後的導向
          redirectToPage();
        }
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


  // 如果正在檢查認證狀態，顯示載入狀態
  if (authLoading || isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">檢查登入狀態中...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    <PageAuthBlocker
      title="請先登入"
      description="您需要登入才能訪問此頁面"
    />
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
          <button className="btn dark:btn-neutral" disabled>
            <FcGoogle className="size-[1.2em]" size={20} />
            Login with Google
          </button>
          <button className="btn dark:btn-neutral" disabled>
            <FaDiscord className="size-[1.2em]" size={20} />
            Login with Discord
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
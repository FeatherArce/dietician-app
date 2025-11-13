"use client";
import { FormErrors } from "@/components/form";
import { Form2, Input } from "@/components/form2";
import PasswordInput from "@/components/form2/controls/PasswordInput";
import { Card } from "@/components/ui/Card";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import { AuthError } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const redirectToNextPage = useCallback(() => {
    // 登入成功，重定向到主頁或指定頁面
    const redirectTo = searchParams.get("redirect");
    if (redirectTo === ROUTE_CONSTANTS.LOGIN || !redirectTo) {
      router.push("/lunch");
    } else {
      router.push(redirectTo);
    }
  }, [router, searchParams]);

  const handleFinish = useCallback(async (values: any) => {
    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        ...values,
        redirect: false,
      });
      redirectToNextPage();
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof AuthError) {
        setErrors([error.message || "登入失敗，請稍後再試。"]);
        return;
      }

      setErrors(["登入失敗，請稍後再試。"]);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToNextPage]);

  useEffect(() => {
    if (status === 'authenticated') {
      redirectToNextPage();
    }
  }, [status, redirectToNextPage]);

  return (
    <Suspense fallback={<div>載入中...</div>}>
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
            <Form2.Button
              type="submit"
              loading={status === 'loading' || isLoading}
              className="btn-primary w-full mt-6"
            >
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
    </Suspense>
  );
}
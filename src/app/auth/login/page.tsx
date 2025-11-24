"use client";
import { Card } from "@/components/ui/Card";
import PageLink from "@/components/ui/PageLink";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { FaDiscord } from "react-icons/fa";

export default function LoginPage() {
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

  useEffect(() => {
    if (status === 'authenticated') {
      redirectToNextPage();
    }
  }, [status, redirectToNextPage]);

  return (
    <Card>
      <div className="mb-2 space-y-2">
        <h2 className="card-title justify-center text-2xl">
          登入
        </h2>
        <p className="text-center text-sm text-gray-500">
          使用以下第三方服務帳號登入
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="w-full flex flex-col gap-2">
          {/* Google */}
          <button className="btn dark:btn-neutral" onClick={() => signIn("discord")}>
            <FaDiscord className="size-[1.2em] text-black dark:text-[#E0E3FF]" size={20} />
            Discord
          </button>
          {/* <button className="btn dark:btn-neutral cursor-not-allowed" disabled>
            <FcGoogle className="size-[1.2em]" size={20} />
            Login with Google
          </button> */}
        </div>
        {/* <p className="text-sm text-center text-black/60">
          是管理員嗎？
          <PageLink href="/auth/login/admin" className="link link-primary ml-1">
            立即登入
          </PageLink>
        </p> */}
      </div>
    </Card>
  );
}
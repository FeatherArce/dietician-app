'use client';
import { useSearchParams } from "next/navigation";
import React from "react";

const errorMessages: Record<string, string> = {
  AccessDenied: "存取被拒絕，請確認帳號狀態。",
  Configuration: "認證系統設定錯誤，請聯絡管理員。",
  Verification: "驗證失敗，請重新操作。",
  CredentialsSignin: "帳號或密碼錯誤。",
  // ...可自訂更多錯誤
};

/**
 * Authentication error page component.
 * @returns
 */
export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = error
    ? errorMessages[error] || "發生未知認證錯誤。"
    : "發生認證錯誤。";

  return (
    <div className="h-full container flex items-center justify-center mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">認證錯誤</h1>
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
}

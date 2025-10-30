"use client";
import { useState } from "react";
import Link from "next/link";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("如果該 Email 存在，我們已經發送密碼重設連結到您的信箱");
        setEmail("");
      } else {
        setError(data.error || "發送失敗");
      }
    } catch (err) {
      let message = "網路錯誤，請稍後再試";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-6">忘記密碼</h2>
          
          <p className="text-sm text-base-content/70 mb-4 text-center">
            請輸入您的 Email 地址，我們將發送密碼重設連結給您
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="alert alert-success mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email 地址</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="請輸入您的 Email"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "發送中..." : "發送重設連結"}
              </button>
            </div>
          </form>

          <div className="divider"></div>

          <div className="text-center space-y-2">
            <p className="text-sm">
              <Link href={ROUTE_CONSTANTS.LOGIN} className="link link-primary">
                返回登入
              </Link>
            </p>
            <p className="text-sm">
              還沒有帳號？
              <Link href="/auth/register" className="link link-secondary ml-1">
                立即註冊
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
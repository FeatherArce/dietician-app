"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push(ROUTE_CONSTANTS.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);

  return (
    <div className="navbar bg-base-100 border-b border-base-300">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl normal-case">訂餐管理系統</Link>
      </div>
      <div className="flex-none gap-2 grid grid-flow-col items-center">
        {isLoading ? (
          <div className="skeleton w-20 h-8"></div>
        ) : user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <div className="avatar avatar-placeholder">
                <div className="bg-neutral text-neutral-content w-10 h-10 rounded-full">
                  <span className="text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <div className="justify-between">
                  <span>{user.name}</span>
                  <span className="badge badge-sm badge-outline">{user.role}</span>
                </div>
              </li>
              <li><span className="text-xs opacity-70">@{user.name}</span></li>
              <div className="divider my-1"></div>
              <li><a href="/profile">個人設定</a></li>
              <li><a onClick={handleLogout}>登出</a></li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-sm btn-ghost">
              登入
            </Link>
            {/* <Link href="/auth/register" className="btn btn-sm btn-primary">
              註冊
            </Link> */}
          </div>
        )}
      </div>
    </div>
  );
}

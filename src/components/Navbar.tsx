"use client";
import Link from "next/link";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const [isPending, startTransition] = useTransition();
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ callbackUrl: ROUTE_CONSTANTS.LOGIN });
      router.push(ROUTE_CONSTANTS.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  return (
    <div className="navbar bg-base-100 border-b border-base-300">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl normal-case">訂餐管理系統</Link>
      </div>
      <div className="flex-none gap-2 grid grid-flow-col items-center">
        {status === 'loading' ? (
          <div className="skeleton w-20 h-8"></div>
        ) : session?.user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">

              {session?.user?.image ? (
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={session.user.image} alt={session.user.name || "User avatar"} />
                  </div>
                </div>
              ) : (
                <div className="avatar avatar-placeholder">
                  <span className="text-xl">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="">
                <div className="justify-between">
                  <span>{session?.user?.name}</span>
                  <span className="badge badge-sm badge-outline">{session?.user?.role}</span>
                </div>
              </li>
              <div className="divider my-1"></div>
              <li><Link href="/profile">個人設定</Link></li>
              <li>
                <a
                  onClick={() => {
                    if (isPending) return;
                    startTransition(handleLogout);
                  }}
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : null}
                  登出
                </a>
              </li>
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

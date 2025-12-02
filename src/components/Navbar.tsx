"use client";
import { APP_NAME, ROUTE_CONSTANTS } from "@/constants/app-constants";
import { useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/libs/utils";
import { UserRole } from "@/prisma-generated/postgres-client";
import PageLink from "./ui/PageLink";

export interface MenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface NavbarMenuProps {
  type: 'dropdown' | 'menu';
  items?: Array<MenuItem>;
}

export function NavbarMenu({ type = 'menu', items }: NavbarMenuProps) {
  return (
    <ul
      tabIndex={-1}
      className={cn(
        "menu menu-md",
        type === 'dropdown' ? "dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow" : "menu-horizontal px-1"
      )}>
      {items?.map((item) => (
        <li key={item.href} className={cn(item.disabled && "opacity-50 pointer-events-none")}>
          <PageLink href={item.href} className="flex items-center gap-2">
            {item.icon}
            {item.label}
          </PageLink>
        </li>
      ))}
    </ul>
  );
}

export default function Navbar() {
  const [isPending, startTransition] = useTransition();
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = useMemo(() => session?.user, [session]);

  const menuItems: MenuItem[] = useMemo(() => {
    const newItems: MenuItem[] = [];
    if (user?.role === UserRole.ADMIN) {
      newItems.push({ label: "使用者管理", href: ROUTE_CONSTANTS.USERS });
    }
    newItems.push({ label: "訂餐系統", href: ROUTE_CONSTANTS.LUNCH });
    return newItems;
  }, [user?.role]);

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
      <div className="navbar-start">
        {/* 手機板: 功能選單 Hamburger Menu */}
        <div className="dropdown md:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
          </div>
          <NavbarMenu type="dropdown" items={menuItems} />
        </div>
        {/* 桌面板: 標題 */}
        <div className="hidden md:block">
          <PageLink href="/" className="btn btn-ghost text-xl normal-case">{APP_NAME}</PageLink>
        </div>
      </div>
      <div className="navbar-center">
        {/* 手機板: 標題 */}
        <div className="block md:hidden">
          <PageLink href="/" className="btn btn-ghost text-xl normal-case">{APP_NAME}</PageLink>
        </div>
        {/* 桌面板: 功能選單 */}
        <div className="hidden md:block">
          <NavbarMenu type="menu" items={menuItems} />
        </div>
      </div>
      <div className="navbar-end">
        {status === 'loading' ? (
          <div className="skeleton w-20 h-8"></div>
        ) : user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">

              {user.image ? (
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={user.image} alt={user.name || "User avatar"} />
                  </div>
                </div>
              ) : (
                <div className="avatar avatar-placeholder">
                  <span className="text-xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="">
                <div className="justify-between">
                  <span>{user?.name}</span>
                  <span className="badge badge-sm badge-outline">{user?.role}</span>
                </div>
              </li>
              <div className="divider my-1"></div>
              <li><PageLink href="/profile">個人設定</PageLink></li>
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
            <PageLink href={ROUTE_CONSTANTS.LOGIN} className="btn btn-sm btn-ghost">
              登入
            </PageLink>
            {/* <PageLink href="/auth/register" className="btn btn-sm btn-primary">
              註冊
            </PageLink> */}
          </div>
        )}
      </div>
    </div>
  );
}

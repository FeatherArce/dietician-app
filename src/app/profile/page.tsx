"use client";
import { User, UserRole } from "@/prisma-generated/postgres-client";
import { useSession } from "next-auth/react";
import { getUserRoleChineseName } from "@/types/User";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCog,
  FaInfo,
  FaPalette,
  FaUser
} from "react-icons/fa";
import UserForm from "./_components/UserForm";
import UserThemeForm from "./_components/UserThemeForm";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import { getUserById } from "@/services/client/user";
import { getAccountsByUserId } from "@/services/client/account-services";
import { signIn } from "next-auth/react";
import { FcBrokenLink, FcLink, FcOk } from "react-icons/fc";
import { toast } from "@/components/Toast";

type TabType = 'info' | 'profile' | 'password' | 'settings' | 'security' | 'third-party';

// TODO: 解除綁定第三方帳號功能、設定密碼功能(僅有第三方帳號沒有預設登入方式的人需要)
export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<Partial<User> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const fetchUserSelf = useCallback(async () => {
    setLoading(true);
    try {
      const uid = session?.user?.id;
      if (!uid) {
        return;
      }
      const { response, result } = await getUserById(uid);

      if (!response.ok || !result.success) {
        throw new Error(result.message || '無法取得使用者資料');
      }

      setUser(result?.user || undefined);
    } catch (error) {
      console.error('Fetch user self error:', error);
      toast.error('錯誤：無法取得使用者資料');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserSelf();
    }
  }, [isAuthenticated, fetchUserSelf]);

  // 側邊欄選項
  const sidebarItems = useMemo(() => ([
    {
      id: 'info' as TabType,
      label: '帳戶資訊',
      icon: FaInfo,
      description: '查看帳戶基本信息'
    },
    {
      id: 'profile' as TabType,
      label: '編輯資料',
      icon: FaUser,
      description: '修改個人資料'
    },
    {
      id: 'third-party' as TabType,
      label: '第三方帳號',
      icon: FaUser,
      description: '管理第三方登入帳號'
    },
    {
      id: 'settings' as TabType,
      label: '偏好設定',
      icon: FaCog,
      description: '系統偏好設定'
    },
  ]), []);

  // 渲染內容區域的函數
  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return renderAccountInfo();
      case 'profile':
        return renderProfileEdit();
      case 'settings':
        return renderSettings();
      case 'third-party':
        return renderThirdPartyAccounts();
      default:
        return renderAccountInfo();
    }
  };

  // 帳戶資訊組件
  const renderAccountInfo = () => (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">帳戶資訊</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">使用者 ID</span>
            </label>
            <input
              type="text"
              value={user?.id || ''}
              className="input input-bordered w-full"
              disabled
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">角色</span>
            </label>
            <input
              type="text"
              value={getUserRoleChineseName(user?.role || UserRole.USER)}
              className="input input-bordered w-full"
              disabled
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">帳戶狀態</span>
            </label>
            <div className="flex items-center space-x-2">
              <span className={`badge ${user?.is_active ? 'badge-success' : 'badge-error'}`}>
                {user?.is_active ? '啟用' : '停用'}
              </span>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">註冊日期</span>
            </label>
            <input
              type="text"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-TW') : ''}
              className="input input-bordered w-full"
              disabled
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">上次登入</span>
            </label>
            <input
              type="text"
              value={user?.last_login ? new Date(user.last_login).toLocaleString('zh-TW') : '從未登入'}
              className="input input-bordered w-full"
              disabled
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">登入次數</span>
            </label>
            <input
              type="text"
              value={user?.login_count || 0}
              className="input input-bordered w-full"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );

  // 編輯個人資料組件
  const renderProfileEdit = () => (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">編輯個人資料</h2>
        <UserForm user={user} />
      </div>
    </div>
  );

  // 偏好設定組件
  const renderSettings = () => (
    <div className="space-y-6">
      {/* 主題設定 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 flex items-center space-x-2">
            <FaPalette className="w-5 h-5 text-primary" />
            <span>主題設定</span>
          </h2>
          <UserThemeForm user={user} />
        </div>
      </div>
    </div>
  );

  // 第三方帳號綁定狀態與操作（僅顯示 Discord）
  const [discordBound, setDiscordBound] = useState<boolean>(false);
  const [discordAccountId, setDiscordAccountId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // 檢查是否已綁定 Discord
  const checkDiscordBinding = useCallback(async () => {
    if (!user?.id) return;
    setChecking(true);
    try {
      const { result } = await getAccountsByUserId(user.id);
      const discord = result?.data?.accounts?.find((a: any) => a.provider === "discord");
      setDiscordBound(!!discord);
      setDiscordAccountId(discord?.providerAccountId || null);
    } catch (e) {
      setDiscordBound(false);
      setDiscordAccountId(null);
    } finally {
      setChecking(false);
    }
  }, [user?.id]);

  // 綁定/解除後自動刷新
  useEffect(() => {
    if (activeTab === "third-party" && user?.id) {
      checkDiscordBinding();
    }
  }, [activeTab, user?.id, checkDiscordBinding]);

  // 處理 Discord 綁定 callback 回到本頁
  const handleBindDiscord = () => {
    signIn("discord", { callbackUrl: window.location.href });
  };

  const renderThirdPartyAccounts = () => {
    if (!user?.id) return null;
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">第三方帳號綁定</h2>
          <div className="flex items-center gap-4">
            <span className="font-semibold">Discord：</span>
            <button
              className="btn btn-discord"
              onClick={handleBindDiscord}
              disabled={checking || discordBound}
            >
              {discordBound ? "已綁定" : "綁定 Discord"}
            </button>

            {checking ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : discordBound ? (
              <FcOk className="w-6 h-6" />
            ) : null
            }
          </div>
          {discordBound && discordAccountId && (
            <div className="mt-2 text-xs text-base-content/60">Discord 帳號 ID：{discordAccountId}</div>
          )}
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">請先登入</h2>
          <p className="mb-4">您需要登入才能查看個人資料</p>
          <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-primary">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-circle"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <FaUser className="w-8 h-8 text-primary" />
            <span>個人資料</span>
          </h1>
          <p className="text-base-content/70 mt-1">
            管理您的帳戶資訊和設定
          </p>
        </div>
      </div>

      {/* 主要布局 - 側邊欄 + 內容區 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左側邊欄 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="space-y-2">
                {sidebarItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${activeTab === item.id
                        ? 'bg-primary text-primary-content'
                        : 'hover:bg-base-200'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className={`text-xs ${activeTab === item.id
                            ? 'text-primary-content/70'
                            : 'text-base-content/70'
                            }`}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 右側內容區 */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
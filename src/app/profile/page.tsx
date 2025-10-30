"use client";
import { UserRole } from "@/prisma-generated/postgres-client";
import { useAuthStore } from "@/stores/auth-store";
import { getUserRoleLabel } from "@/types/User";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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

type TabType = 'info' | 'profile' | 'password' | 'settings' | 'security';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('info');

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
              <span className="label-text font-semibold">用戶 ID</span>
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
              value={getUserRoleLabel(user?.role || UserRole.USER)}
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
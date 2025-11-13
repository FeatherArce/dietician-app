"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaArrowLeft, 
  FaEdit, 
  FaUserCheck, 
  FaUserSlash, 
  FaShoppingCart, 
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaUser
} from "react-icons/fa";
import { User, UserRole } from "@/prisma-generated/postgres-client";
import Breadcrumb from "@/components/Breadcrumb";
import { getUserRoleChineseName } from "@/types/User";

interface UserWithStats extends User {
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  recentOrders: Array<{
    id: string;
    total: number;
    created_at: Date;
    event: {
      id: string;
      title: string;
      event_date: Date;
    };
  }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<UserWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/users");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      router.push("/users");
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  const toggleUserStatus = async () => {
    if (!user) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      if (response.ok) {
        await fetchUser();
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      ADMIN: "badge-error",
      USER: "badge-info",
      MODERATOR: "badge-warning",
      GUEST: "badge-secondary"
    };
    
    const labels: Record<UserRole, string> = {
      ADMIN: getUserRoleChineseName(UserRole.ADMIN),
      MODERATOR: getUserRoleChineseName(UserRole.MODERATOR),
      USER: getUserRoleChineseName(UserRole.USER),
      GUEST: getUserRoleChineseName(UserRole.GUEST)
    };

    return (
      <span className={`badge ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">找不到使用者</h2>
          <button 
            onClick={() => router.back()} 
            className="btn btn-primary"
          >
            返回上一頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <Breadcrumb 
        items={[
          { label: '使用者管理', href: '/users' },
          { label: user.name, current: true }
        ]} 
      />

      {/* 頁面標題和操作 */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()} 
            className="btn btn-ghost btn-circle"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <span>{user.name}</span>
              {getRoleBadge(user.role)}
              <span
                className={`badge ${
                  user.is_active ? "badge-success" : "badge-error"
                }`}
              >
                {user.is_active ? "啟用" : "停用"}
              </span>
            </h1>
            <p className="text-base-content/70 mt-1">
              使用者詳細資料與訂餐記錄
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link
            href={`/users/${userId}/edit`}
            className="btn btn-ghost"
          >
            <FaEdit className="w-4 h-4" />
            編輯
          </Link>
          <button
            className={`btn ${user.is_active ? "btn-error" : "btn-success"}`}
            onClick={toggleUserStatus}
            disabled={updating}
          >
            {updating ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : user.is_active ? (
              <>
                <FaUserSlash className="w-4 h-4" />
                停用
              </>
            ) : (
              <>
                <FaUserCheck className="w-4 h-4" />
                啟用
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本資料 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">基本資料</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="avatar avatar-placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-16 h-16">
                      <span className="text-xl">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{user.name}</div>
                    <div className="text-sm text-base-content/70">
                      ID: {user.id}
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="w-4 h-4 text-base-content/70" />
                    <div>
                      <div className="text-sm text-base-content/70">Email</div>
                      <div>{user.email || "未設定"}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FaUser className="w-4 h-4 text-base-content/70" />
                    <div>
                      <div className="text-sm text-base-content/70">角色</div>
                      <div>{getRoleBadge(user.role)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="w-4 h-4 text-base-content/70" />
                    <div>
                      <div className="text-sm text-base-content/70">註冊時間</div>
                      <div>{new Date(user.created_at).toLocaleString("zh-TW")}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FaClock className="w-4 h-4 text-base-content/70" />
                    <div>
                      <div className="text-sm text-base-content/70">最後登入</div>
                      <div>
                        {user.last_login
                          ? new Date(user.last_login).toLocaleString("zh-TW")
                          : "從未登入"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 統計資料和最近訂單 */}
        <div className="lg:col-span-2">
          {/* 統計卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stat bg-base-100 rounded-lg shadow-sm">
              <div className="stat-figure text-primary">
                <FaShoppingCart className="w-8 h-8" />
              </div>
              <div className="stat-title">總訂單數</div>
              <div className="stat-value text-primary">{user.orderCount}</div>
              <div className="stat-desc">累計訂單次數</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow-sm">
              <div className="stat-title">總消費金額</div>
              <div className="stat-value">${user.totalSpent}</div>
              <div className="stat-desc">累計消費</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow-sm">
              <div className="stat-title">平均訂單金額</div>
              <div className="stat-value">${user.averageOrderValue}</div>
              <div className="stat-desc">
                {user.lastOrderDate && (
                  `最後訂單: ${new Date(user.lastOrderDate).toLocaleDateString("zh-TW")}`
                )}
              </div>
            </div>
          </div>

          {/* 最近訂單 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h3 className="card-title">最近訂單</h3>
                <Link 
                  href={`/lunch/orders?userId=${userId}`}
                  className="btn btn-ghost btn-sm"
                >
                  查看全部
                </Link>
              </div>

              {user.recentOrders && user.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>訂單編號</th>
                        <th>活動</th>
                        <th>金額</th>
                        <th>訂單時間</th>
                        <th>活動時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <Link 
                              href={`/lunch/orders/${order.id}`}
                              className="link link-primary"
                            >
                              {order.id.slice(-8)}
                            </Link>
                          </td>
                          <td>
                            <Link 
                              href={`/lunch/events/${order.event.id}`}
                              className="link"
                            >
                              {order.event.title}
                            </Link>
                          </td>
                          <td>${order.total}</td>
                          <td>
                            {new Date(order.created_at).toLocaleDateString("zh-TW")}
                          </td>
                          <td>
                            {new Date(order.event.event_date).toLocaleDateString("zh-TW")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/70">
                  尚無訂單記錄
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
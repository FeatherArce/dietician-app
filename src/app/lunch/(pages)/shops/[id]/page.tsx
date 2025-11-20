"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaEdit,
  FaStore,
  FaToggleOn,
  FaToggleOff,
  FaPhone,
  FaMapMarkerAlt,
  FaUtensils,
  FaCalendarAlt,
  FaShoppingCart,
  FaPlus,
  FaEye
} from "react-icons/fa";
import { Shop } from "@/prisma-generated/postgres-client";
import Breadcrumb from "@/components/Breadcrumb";
import Tabs from "@/components/ui/Tabs";
import PageLink from "@/components/ui/PageLink";

interface ShopWithDetails extends Shop {
  menus?: Array<{
    id: string;
    name: string;
    description?: string;
    is_available: boolean;
    categories?: Array<{
      id: string;
      name: string;
      items?: Array<{
        id: string;
        name: string;
      }>;
    }>;
    items?: Array<{
      id: string;
      name: string;
    }>;
    _count?: {
      items: number;
    };
  }>;
  _count?: {
    menus: number;
    events: number;
  };
}

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<ShopWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchShop = useCallback(async () => {
    try {
      const response = await fetch(`/api/lunch/shops/${shopId}`);
      if (response.ok) {
        const data = await response.json();
        setShop(data.shop);
      } else {
        router.push("/lunch/shops");
      }
    } catch (error) {
      console.error("Failed to fetch shop:", error);
      router.push("/lunch/shops");
    } finally {
      setLoading(false);
    }
  }, [shopId, router]);

  useEffect(() => {
    if (shopId) {
      fetchShop();
    }
  }, [shopId, fetchShop]);

  const toggleShopStatus = async () => {
    if (!shop) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/lunch/shops/${shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !shop.is_active }),
      });

      if (response.ok) {
        await fetchShop();
      }
    } catch (error) {
      console.error("Failed to update shop status:", error);
    } finally {
      setUpdating(false);
    }
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

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">找不到商店</h2>
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
          { label: '商店管理', href: '/lunch/shops' },
          { label: shop.name, current: true }
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
              <FaStore className="w-8 h-8 text-primary" />
              <span>{shop.name}</span>
              <span
                className={`badge ${shop.is_active ? "badge-success" : "badge-error"
                  }`}
              >
                {shop.is_active ? "營業中" : "暫停營業"}
              </span>
            </h1>
            <p className="text-base-content/70 mt-1">
              商店詳細資料與菜單管理
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/lunch/shops/${shopId}/edit`}
            className="btn btn-ghost"
          >
            <FaEdit className="w-4 h-4" />
            編輯
          </Link>
          <button
            className={`btn ${shop.is_active ? "btn-error" : "btn-success"}`}
            onClick={toggleShopStatus}
            disabled={updating}
          >
            {updating ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : shop.is_active ? (
              <>
                <FaToggleOff className="w-4 h-4" />
                暫停營業
              </>
            ) : (
              <>
                <FaToggleOn className="w-4 h-4" />
                恢復營業
              </>
            )}
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 mb-6">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <FaUtensils className="w-8 h-8" />
          </div>
          <div className="stat-title">菜單數量</div>
          <div className="stat-value text-primary">{shop._count?.menus || 0}</div>
          <div className="stat-desc">可用菜單</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-secondary">
            <FaCalendarAlt className="w-8 h-8" />
          </div>
          <div className="stat-title">參與活動</div>
          <div className="stat-value text-secondary">{shop._count?.events || 0}</div>
          <div className="stat-desc">累計活動次數</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-accent">
            <FaShoppingCart className="w-8 h-8" />
          </div>
          <div className="stat-title">菜單項目</div>
          <div className="stat-value text-accent">
            {shop.menus?.reduce((total, menu) => total + (menu._count?.items || 0), 0) || 0}
          </div>
          <div className="stat-desc">總菜單項目</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">商店狀態</div>
          <div className="stat-value">
            {shop.is_active ? (
              <span className="text-success">營業中</span>
            ) : (
              <span className="text-error">暫停營業</span>
            )}
          </div>
          <div className="stat-desc">目前狀態</div>
        </div>
      </div>

      <Tabs
        onTabChange={(tabId: string) => { }}
        items={[
          {
            id: 'overview',
            label: '基本資料',
            content: (<>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 基本資料 */}
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title text-lg mb-4">基本資料</h3>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <FaStore className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-semibold text-lg">{shop.name}</div>
                          <div className="text-sm text-base-content/70">
                            ID: {shop.id}
                          </div>
                        </div>
                      </div>

                      <div className="divider"></div>

                      <div className="space-y-3">
                        {shop.address && (
                          <div className="flex items-start space-x-3">
                            <FaMapMarkerAlt className="w-4 h-4 text-base-content/70 mt-1" />
                            <div>
                              <div className="text-sm text-base-content/70">地址</div>
                              <div>{shop.address}</div>
                            </div>
                          </div>
                        )}

                        {shop.phone && (
                          <div className="flex items-center space-x-3">
                            <FaPhone className="w-4 h-4 text-base-content/70" />
                            <div>
                              <div className="text-sm text-base-content/70">電話</div>
                              <div>{shop.phone}</div>
                            </div>
                          </div>
                        )}

                        {shop.description && (
                          <div className="flex items-start space-x-3">
                            <div className="w-4 h-4 text-base-content/70 mt-1">📝</div>
                            <div>
                              <div className="text-sm text-base-content/70">描述</div>
                              <div className="text-base-content/80">{shop.description}</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-3">
                          <FaCalendarAlt className="w-4 h-4 text-base-content/70" />
                          <div>
                            <div className="text-sm text-base-content/70">建立時間</div>
                            <div>{new Date(shop.created_at).toLocaleString("zh-TW")}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 營業時間 */}
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title text-lg mb-4">營業資訊</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>營業狀態</span>
                        <span
                          className={`badge ${shop.is_active ? "badge-success" : "badge-error"
                            }`}
                        >
                          {shop.is_active ? "營業中" : "暫停營業"}
                        </span>
                      </div>

                      <div className="divider"></div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {shop._count?.menus || 0}
                          </div>
                          <div className="text-sm text-base-content/70">菜單數量</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-secondary">
                            {shop._count?.events || 0}
                          </div>
                          <div className="text-sm text-base-content/70">參與活動</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>)
          },
          {
            id: 'menus',
            label: '菜單管理',
            content: (<>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">菜單管理</h3>
                  <PageLink
                    href={`/lunch/shops/${shopId}/menus/new`}
                    className="btn btn-primary"
                  >
                    <FaPlus className="w-4 h-4" />
                    新增菜單
                  </PageLink>
                </div>

                {shop.menus && shop.menus.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shop.menus.map((menu) => (
                      <div key={menu.id} className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="card-title">{menu.name}</h4>
                              {menu.description && (
                                <p className="text-sm text-base-content/70 mt-1">
                                  {menu.description}
                                </p>
                              )}
                            </div>
                            <span
                              className={`badge ${menu.is_available ? "badge-success" : "badge-error"
                                } badge-sm`}
                            >
                              {menu.is_available ? "可用" : "停用"}
                            </span>
                          </div>

                          <div className="mt-3">
                            <div className="text-sm text-base-content/70">
                              {menu.categories?.length || 0} 個分類, {menu._count?.items || 0} 個項目
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {menu.categories?.map((category) => (
                                <span key={category.id} className="badge badge-outline badge-xs">
                                  {category.name} ({category.items?.length || 0})
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="card-actions justify-end mt-4">
                            <Link
                              href={`/lunch/shops/${shopId}/menus/${menu.id}`}
                              className="btn btn-primary btn-sm"
                            >
                              <FaEye className="w-3 h-3" />
                              管理
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaUtensils className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                    <h4 className="text-lg font-semibold mb-2">尚無菜單</h4>
                  </div>
                )}
              </div>
            </>)
          },
          {
            id: 'events',
            label: '相關活動',
            content: (<>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">相關活動</h3>
                  <Link
                    href={`/lunch/events/new?shopId=${shopId}`}
                    className="btn btn-primary"
                  >
                    <FaPlus className="w-4 h-4" />
                    建立活動
                  </Link>
                </div>

                <div className="text-center py-12">
                  <FaCalendarAlt className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                  <h4 className="text-lg font-semibold mb-2">暫無活動資料</h4>
                  <p className="text-base-content/70 mb-4">目前沒有相關的活動記錄</p>
                  <Link
                    href={`/lunch/events?shop_id=${shopId}`}
                    className="btn btn-outline"
                  >
                    查看所有活動
                  </Link>
                </div>
              </div>
            </>)
          }
        ]}
      />
    </div>
  );
}
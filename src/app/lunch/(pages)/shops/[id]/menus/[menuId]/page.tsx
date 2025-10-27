"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import {
  FaArrowLeft,
  FaUtensils,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff
} from "react-icons/fa";
import Breadcrumb from "@/components/Breadcrumb";
import { authFetch } from "@/utils/auth-fetch";
import { Select } from "@/components/SearchContainer/SearchFields";
import { ShopFormData } from "@/components/shop/ShopForm";
import MenuCategoryManager, { MenuCategory } from "@/components/menu/MenuCategoryManager";
import MenuItemManager, { MenuItem } from "@/components/menu/MenuItemManager";
import { Menu } from "@/prisma-generated/postgres-client";

interface MenuData extends Menu {
  categories?: Array<MenuCategory>;
  items?: Array<MenuItem>;
}

interface ShopData extends ShopFormData {
  id: string;
  menus?: Array<MenuData>;
}

export default function MenuDetailPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  const menuId = params.menuId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const selectedMenu = useMemo(() => {
    if (!selectedMenuId) return null;

    const foundMenu = shopData?.menus?.find(m => m.id === selectedMenuId) || null;
    return foundMenu;
  }, [selectedMenuId, shopData]);

  // 獲取菜單資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 獲取商店資料
        const shopResponse = await authFetch(`/api/lunch/shops/${shopId}`);
        if (shopResponse.ok) {
          const data = await shopResponse.json();
          console.log("Shop Data:", data);
          setShopData(data.shop);
        }

        // 獲取菜單資料
        const menuResponse = await authFetch(`/api/lunch/shops/${shopId}/menus/${menuId}`);
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          setMenu(menuData.menu);
        } else {
          throw new Error("菜單不存在");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (shopId && menuId) {
      fetchData();
    }
  }, [shopId, menuId, router]);

  const toggleMenuStatus = async () => {
    if (!menu) return;

    setUpdating(true);
    try {
      const response = await authFetch(`/api/lunch/shops/${shopId}/menus/${menuId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !menu.is_available }),
      });

      if (response.ok) {
        setMenu(prev => prev ? { ...prev, is_available: !prev.is_available } : null);
      }
    } catch (error) {
      console.error("Failed to update menu status:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
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
          <p className="mb-4">您需要登入才能管理菜單</p>
          <Link href="/auth/login" className="btn btn-primary">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  if (!shopData || !menu) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">菜單不存在</h2>
          <p className="mb-4">找不到指定的菜單</p>
          <button
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            返回
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
          { label: shopData.name, href: `/lunch/shops/${shopId}` },
          { label: menu.name, current: true }
        ]}
      />

      {/* 頁面標題 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-circle"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <FaUtensils className="w-8 h-8 text-primary" />
              <span>{menu.name}</span>
              <span
                className={`badge ${menu.is_available ? "badge-success" : "badge-error"
                  }`}
              >
                {menu.is_available ? "啟用中" : "已停用"}
              </span>
            </h1>
            <p className="text-base-content/70 mt-1">
              {shopData.name} - 菜單管理
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/lunch/shops/${shopId}/menus/${menuId}/edit`}
            className="btn btn-ghost"
          >
            <FaEdit className="w-4 h-4" />
            編輯菜單
          </Link>
          <button
            className={`btn ${menu.is_available ? "btn-error" : "btn-success"}`}
            onClick={toggleMenuStatus}
            disabled={updating}
          >
            {updating ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : menu.is_available ? (
              <>
                <FaToggleOff className="w-4 h-4" />
                停用
              </>
            ) : (
              <>
                <FaToggleOn className="w-4 h-4" />
                啟用
              </>
            )}
          </button>
        </div>
      </div>

      {/* 菜單描述 */}
      {menu.description && (
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <h3 className="card-title text-lg">菜單描述</h3>
            <p className="text-base-content/70">{menu.description}</p>
          </div>
        </div>
      )}

      {/* 菜單管理區域 */}
      <div className="w-full">
        <div className="space-y-6">
          {/* 菜單選擇 */}
          <div className="w-full">
            <h2 className="card-title text-xl mb-4">選擇菜單</h2>
            <div className="flex justify-between items-center gap-2">
              <Select
                label="選擇菜單"
                layoutOptions={{ className: "w-80" }}
                value={selectedMenuId}
                onChange={(value) => { setSelectedMenuId(value) }}
                options={(shopData?.menus || [])?.map(menu => ({
                  value: menu.id,
                  label: menu.name
                }))}
              />
              <Link
                href={`/lunch/shops/${shopId}/menus/new`}
                className="btn btn-primary btn-sm"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                建立菜單
              </Link>
            </div>
          </div>

          {(!shopData?.menus || shopData.menus.length === 0) && (
            <div className="text-center py-4">
              <p className="text-base-content/70">
                此商店尚未建立菜單，請先建立菜單。
              </p>
            </div>
          )}

          {selectedMenuId && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 分類管理 */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <MenuCategoryManager
                    menuId={selectedMenuId}
                    categories={selectedMenu?.categories || []}
                    onCategoriesChange={(newCategories) => {
                      // 應該是要去更新前端的 categories 狀態
                    }}
                  />
                </div>
              </div>

              {/* 項目管理 */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <MenuItemManager
                    menuId={selectedMenuId}
                    items={selectedMenu?.items || []}
                    categories={selectedMenu?.categories || []}
                    onItemsChange={(newItems) => {
                      // 應該是要去更新前端的 items 狀態
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
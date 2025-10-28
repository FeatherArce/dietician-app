"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import {
  FaArrowLeft,
  FaStore,
  FaEdit,
  FaUtensils,
  FaList,
  FaExclamationCircle,
  FaPlus
} from "react-icons/fa";
import Breadcrumb from "@/components/Breadcrumb";
import Tabs from "@/components/Tabs";
import FullShopForm, {
  ShopForm,
  ShopFormData,
  ShopFormErrors
} from "@/components/shop/ShopForm";
import { authFetch } from "@/libs/auth-fetch";
import MenuCategoryManager, { MenuCategory } from "@/components/menu/MenuCategoryManager";
import MenuItemManager, { MenuItem } from "@/components/menu/MenuItemManager";
import { Select } from "@/components/SearchContainer/SearchFields";

interface ShopData extends ShopFormData {
  id: string;
  menus?: Array<{
    id: string;
    name: string;
    description?: string;
    is_available: boolean;
    categories: MenuCategory[];
  }>;
}

export default function EditShopPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [shopData, setShopData] = useState<ShopData | null>(null);

  // 商店基本資訊
  const [formData, setFormData] = useState<ShopFormData>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    is_active: true
  });
  const [errors, setErrors] = useState<ShopFormErrors>({});

  // 菜單管理狀態
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  // 認證檢查
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // 獲取商店和菜單資料
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    // 載入選中菜單的分類和項目
    const loadMenuContent = async (menuId: string) => {
      try {
        const response = await authFetch(`/api/lunch/shops/${shopId}/menus/${menuId}`);
        const data = await response.json();

        if (data.success && data.menu) {
          const menu = data.menu;
          setCategories(menu.categories || []);

          // 從分類中提取所有項目
          const allItems: MenuItem[] = [];
          menu.categories?.forEach((category: MenuCategory & { items?: MenuItem[] }) => {
            if (category.items) {
              allItems.push(...category.items.map((item: MenuItem) => ({
                ...item,
                category_id: category.id,
                category: { id: category.id, name: category.name }
              })));
            }
          });
          setItems(allItems);
        }
      } catch (error) {
        console.error('Failed to load menu content:', error);
      }
    };

    const fetchShopData = async () => {
      try {
        const response = await authFetch(`/api/lunch/shops/${shopId}`);
        const data = await response.json();

        if (data.success && data.shop) {
          const shop = data.shop;
          setShopData(shop);

          // 設定商店基本資訊
          setFormData({
            name: shop.name,
            description: shop.description || "",
            address: shop.address || "",
            phone: shop.phone || "",
            email: shop.email || "",
            website: shop.website || "",
            is_active: shop.is_active
          });

          // 如果有菜單，選擇第一個菜單並載入其分類和項目
          if (shop.menus && shop.menus.length > 0) {
            const firstMenu = shop.menus[0];
            setSelectedMenuId(firstMenu.id);
            loadMenuContent(firstMenu.id);
          }
        } else {
          throw new Error(data.error || '商店不存在');
        }
      } catch (error) {
        console.error('Failed to fetch shop:', error);
        setErrors({
          submit: error instanceof Error ? error.message : '載入商店失敗'
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (shopId) {
      fetchShopData();
    }
  }, [shopId, authLoading, isAuthenticated]);

  const handleFinish = useCallback(async (values: any) => {
    console.log('FullShopForm 提交值:', values);

    setLoading(true);
    try {
      const response = await authFetch(`/api/lunch/shops/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.back();
      } else {
        throw new Error(data.error || '更新商店失敗');
      }
    } catch (error) {
      console.error('Failed to update shop:', error);
      setErrors({
        submit: error instanceof Error ? error.message : '更新商店失敗'
      });
    } finally {
      setLoading(false);
    }
  }, [router, shopId]);

  // 載入狀態
  if (authLoading || initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-base-content/70">載入中...</p>
        </div>
      </div>
    );
  }

  // 未認證狀態
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaExclamationCircle className="w-16 h-16 mx-auto text-warning mb-4" />
          <h2 className="text-2xl font-bold mb-2">需要登入</h2>
          <p className="text-base-content/70 mb-6">請先登入以存取此頁面</p>
          <Link href="/auth/login" className="btn btn-primary">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  // 商店資料不存在
  if (!shopData) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaExclamationCircle className="w-16 h-16 mx-auto text-error mb-4" />
          <h2 className="text-2xl font-bold mb-2">商店不存在</h2>
          <p className="text-base-content/70 mb-6">找不到指定的商店資料</p>
          <Link href="/lunch/shops" className="btn btn-primary">
            返回商店列表
          </Link>
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
          { label: '編輯', current: true }
        ]}
      />

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
            <FaEdit className="w-8 h-8 text-primary" />
            <span>編輯商店</span>
          </h1>
          <p className="text-base-content/70 mt-1">
            修改 「{shopData.name}」 的資訊
          </p>
        </div>
      </div>

      {/* 分頁界面 */}
      <div className="max-w-2xl mx-auto">
        <FullShopForm
          initialValues={formData}
          onFinish={handleFinish}
        />
      </div>

      {/* 錯誤訊息 */}
      {errors.submit && (
        <div className="alert alert-error mt-4">
          <FaExclamationCircle className="w-5 h-5" />
          <span>{errors.submit}</span>
        </div>
      )}
    </div>
  );
}
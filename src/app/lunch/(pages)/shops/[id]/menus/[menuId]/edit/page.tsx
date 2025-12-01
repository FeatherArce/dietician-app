"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FaArrowLeft,
  FaSpinner,
  FaSave,
  FaEdit
} from "react-icons/fa";
import Breadcrumb, { lunchBreadcrumbHomeItem } from "@/components/Breadcrumb";
import MenuCategoryManager, { MenuCategory } from "@/components/menu/MenuCategoryManager";
import MenuItemManager, { MenuItem } from "@/components/menu/MenuItemManager";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import PageAuthBlocker from "@/components/page/PageAuthBlocker";
import PageContainer from "@/components/page/PageContainer";

interface MenuData {
  id: string;
  name: string;
  description?: string;
  is_available: boolean;
  categories: MenuCategory[];
  items?: MenuItem[];
}

interface ShopData {
  id: string;
  name: string;
}

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  const menuId = params.menuId as string;
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_available: true
  });

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [currentTab, setCurrentTab] = useState<'basic' | 'categories' | 'items'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 獲取商店和菜單資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 獲取商店資料
        const shopResponse = await fetch(`/api/lunch/shops/${shopId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (shopResponse.ok) {
          const shopData = await shopResponse.json();
          setShopData(shopData.shop);
        }

        // 獲取菜單資料
        const menuResponse = await fetch(`/api/lunch/shops/${shopId}/menus/${menuId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (menuResponse.ok) {
          const menuResponseData = await menuResponse.json();
          const menu = menuResponseData.menu;

          setMenuData(menu);
          setFormData({
            name: menu.name,
            description: menu.description || "",
            is_available: menu.is_available
          });

          // 設定分類和項目資料
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
        } else {
          throw new Error('菜單不存在');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setErrors({
          submit: error instanceof Error ? error.message : '載入資料失敗'
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (shopId && menuId) {
      fetchData();
    }
  }, [shopId, menuId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "菜單名稱為必填";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/lunch/shops/${shopId}/menus/${menuId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...formData,
          description: formData.description.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.back();
      } else {
        throw new Error(data.error || '更新菜單失敗');
      }
    } catch (error) {
      console.error('Failed to update menu:', error);
      setErrors({
        submit: error instanceof Error ? error.message : '更新菜單失敗'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (authLoading || initialLoading) {
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
      <PageAuthBlocker
        description="您需要登入才能編輯菜單"
        loading={authLoading}
      />
    );
  }

  if (!shopData || !menuData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">資料不存在</h2>
          <p className="mb-4">找不到指定的商店或菜單</p>
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
    <PageContainer>
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          lunchBreadcrumbHomeItem,
          { label: '商店管理', href: '/lunch/shops' },
          { label: shopData.name, href: `/lunch/shops/${shopId}` },
          { label: menuData.name, href: `/lunch/shops/${shopId}/menus/${menuId}` },
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
            <span>編輯菜單</span>
          </h1>
          <p className="text-base-content/70 mt-1">
            修改 「{menuData.name}」 的設定與內容
          </p>
        </div>
      </div>

      {/* 分頁標籤 */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${currentTab === 'basic' ? 'tab-active' : ''}`}
          onClick={() => setCurrentTab('basic')}
        >
          基本資訊
        </button>
        <button
          className={`tab ${currentTab === 'categories' ? 'tab-active' : ''}`}
          onClick={() => setCurrentTab('categories')}
        >
          分類管理
        </button>
        <button
          className={`tab ${currentTab === 'items' ? 'tab-active' : ''}`}
          onClick={() => setCurrentTab('items')}
        >
          項目管理
        </button>
      </div>

      <div className="space-y-6">
        {currentTab === 'basic' && (
          /* 基本資訊編輯 */
          <div className="card bg-base-100 shadow-sm">
            <form onSubmit={handleSubmit} className="card-body">
              <h2 className="card-title text-xl mb-4">基本資訊</h2>

              <div className="grid grid-cols-1 gap-6">
                {/* 菜單名稱 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">菜單名稱 *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="例如：早餐菜單、午餐套餐"
                    className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.name}</span>
                    </label>
                  )}
                </div>

                {/* 菜單描述 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">菜單描述</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="菜單的詳細說明..."
                    className="textarea textarea-bordered w-full"
                    rows={3}
                  />
                </div>

                {/* 啟用狀態 */}
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text font-semibold">啟用菜單</span>
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleInputChange}
                      className="checkbox checkbox-primary"
                    />
                  </label>
                  <label className="label">
                    <span className="label-text-alt">
                      取消勾選將停用菜單，不會出現在訂餐選項中
                    </span>
                  </label>
                </div>
              </div>

              {/* 錯誤訊息 */}
              {errors.submit && (
                <div className="alert alert-error">
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* 操作按鈕 */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-ghost"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      儲存變更
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {currentTab === 'categories' && (
          /* 分類管理 */
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <MenuCategoryManager
                menuId={menuId}
                categories={categories}
                onCategoriesChange={setCategories}
              />
            </div>
          </div>
        )}

        {currentTab === 'items' && (
          /* 項目管理 */
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <MenuItemManager
                shopId={shopId}
                menuId={menuId}
                items={items}
                categories={categories}
                onItemsChange={setItems}
              />
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
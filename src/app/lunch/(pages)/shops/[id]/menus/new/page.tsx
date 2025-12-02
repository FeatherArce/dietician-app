"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FaArrowLeft,
  FaUtensils,
  FaSpinner,
  FaSave
} from "react-icons/fa";
import Breadcrumb, { lunchBreadcrumbHomeItem } from "@/components/Breadcrumb";
import MenuCategoryManager, { MenuCategory } from "@/components/menu/MenuCategoryManager";
import MenuItemManager, { MenuItem } from "@/components/menu/MenuItemManager";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";

interface Shop {
  id: string;
  name: string;
}

export default function NewMenuPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_available: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 新增的狀態：管理分類和項目
  const [createdMenuId, setCreatedMenuId] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [currentStep, setCurrentStep] = useState<'menu' | 'details'>('menu');

  // 獲取商店資料
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await fetch(`/api/lunch/shops/${shopId}`);
        if (response.ok) {
          const data = await response.json();
          setShop(data.shop);
        } else {
          throw new Error("商店不存在");
        }
      } catch (error) {
        console.error("Failed to fetch shop:", error);
        router.back();
      } finally {
        setInitialLoading(false);
      }
    };

    if (shopId) {
      fetchShop();
    }
  }, [shopId, router]);

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

    if (currentStep === 'menu') {
      // 第一步：建立菜單
      setLoading(true);
      try {
        const response = await fetch(`/api/lunch/shops/${shopId}/menus`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            is_available: formData.is_available
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setCreatedMenuId(data.menu.id);
          setCurrentStep('details');
        } else {
          throw new Error(data.error || '建立菜單失敗');
        }
      } catch (error) {
        console.error('Failed to create menu:', error);
        setErrors({
          submit: error instanceof Error ? error.message : '建立菜單失敗'
        });
      } finally {
        setLoading(false);
      }
    } else {
      // 第二步：完成並返回
      router.back();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // 清除對應的錯誤
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">請先登入</h2>
          <p className="mb-4">您需要登入才能建立菜單</p>
          <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-primary">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">商店不存在</h2>
          <p className="mb-4">找不到指定的商店</p>
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
          lunchBreadcrumbHomeItem,
          { label: '商店管理', href: ROUTE_CONSTANTS.LUNCH_SHOPS },
          { label: shop.name, href: ROUTE_CONSTANTS.LUNCH_SHOP_DETAIL(shopId) },
          { label: '新增菜單', current: true }
        ]}
      />

      {/* 頁面標題 */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => {
            if (currentStep === 'details') {
              setCurrentStep('menu');
            } else {
              router.back();
            }
          }}
          className="btn btn-ghost btn-circle"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <FaUtensils className="w-8 h-8 text-primary" />
            <span>
              {currentStep === 'menu' ? '新增菜單' : '設定菜單內容'}
            </span>
          </h1>
          <p className="text-base-content/70 mt-1">
            {currentStep === 'menu'
              ? `為 「${shop.name}」 建立新的菜單`
              : `為 「${formData.name}」 新增分類和項目`
            }
          </p>
        </div>
      </div>

      {/* 步驟指示器 */}
      <div className="mb-6">
        <ul className="steps steps-horizontal w-full">
          <li className={`step ${currentStep === 'menu' ? 'step-primary' : 'step-primary'}`}>
            基本資訊
          </li>
          <li className={`step ${currentStep === 'details' ? 'step-primary' : ''}`}>
            菜單內容
          </li>
        </ul>
      </div>

      {/* 表單 */}
      <div className="space-y-6">
        {currentStep === 'menu' ? (
          /* 第一步：基本資訊 */
          <div className="card bg-base-100 shadow-sm">
            <form onSubmit={handleSubmit} className="card-body">
              <div className="grid grid-cols-1 gap-6">
                {/* 基本資訊 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">基本資訊</h3>

                  {/* 菜單名稱 */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">菜單名稱 <span className="text-error">*</span></span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
                      placeholder="例如：早餐菜單、午餐套餐"
                    />
                    {errors.name && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.name}</span>
                      </label>
                    )}
                  </div>

                  {/* 菜單描述 */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">菜單描述</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="textarea textarea-bordered"
                      placeholder="菜單的詳細說明..."
                      rows={3}
                    />
                  </div>

                  {/* 狀態設定 */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start space-x-2">
                      <input
                        type="checkbox"
                        name="is_available"
                        checked={formData.is_available}
                        onChange={handleInputChange}
                        className="toggle toggle-primary"
                      />
                      <span className="label-text">啟用菜單</span>
                    </label>
                    <label className="label">
                      <span className="label-text-alt">
                        停用的菜單將不會在訂餐時顯示
                      </span>
                    </label>
                  </div>
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
                      建立中...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      建立菜單並繼續
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 第二步：菜單內容管理 */
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="alert alert-info mb-4">
                  <span>
                    菜單 「{formData.name}」 已建立成功！現在您可以為菜單新增分類和項目。
                    您也可以稍後在菜單詳情頁面進行管理。
                  </span>
                </div>

                <MenuCategoryManager
                  shopId={shopId}
                  menuId={createdMenuId!}
                  categories={categories}
                  onCategoriesChange={setCategories}
                />
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <MenuItemManager
                  shopId={shopId}
                  menuId={createdMenuId!}
                  items={items}
                  categories={categories}
                  onItemsChange={setItems}
                />
              </div>
            </div>

            {/* 完成按鈕 */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCurrentStep('menu')}
                className="btn btn-ghost"
              >
                返回編輯基本資訊
              </button>
              <button
                onClick={() => router.back()}
                className="btn btn-primary"
              >
                <FaSave className="w-4 h-4" />
                完成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
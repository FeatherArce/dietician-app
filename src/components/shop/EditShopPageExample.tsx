"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import {
  FaArrowLeft,
  FaSpinner,
  FaSave,
  FaEdit
} from "react-icons/fa";
import Breadcrumb from "@/components/Breadcrumb";
import FullShopForm, {
  ShopForm,
  ShopFormData,
  ShopFormErrors,
  getInitialShopFormData,
  validateShopForm,
  cleanShopFormData
} from "@/components/shop/ShopForm";
import { authFetch } from "@/libs/auth-fetch";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";

interface ShopData extends ShopFormData {
  id: string;
}

export default function EditShopPageExample() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [formData, setFormData] = useState<ShopFormData>(getInitialShopFormData());
  const [errors, setErrors] = useState<ShopFormErrors>({});

  // 獲取商店資料
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await fetch(`/api/lunch/shops/${shopId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await response.json();

        if (data.success && data.shop) {
          const shop = data.shop;
          setShopData(shop);

          // 填入表單資料
          setFormData({
            name: shop.name,
            description: shop.description || "",
            address: shop.address || "",
            phone: shop.phone || "",
            email: shop.email || "",
            website: shop.website || "",
            is_active: shop.is_active
          });
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
      fetchShop();
    }
  }, [shopId]);

  const handleFormChange = (name: keyof ShopFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // 清除對應的錯誤
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證表單
    const validationErrors = validateShopForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const requestData = cleanShopFormData(formData);

      const response = await fetch(`/api/lunch/shops/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(requestData),
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
  };

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
  }, [shopId, router]);

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
          <p className="mb-4">您需要登入才能編輯商店</p>
          <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-primary">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  if (!shopData) {
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

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 使用 ShopForm 組件 */}
          {/* <ShopForm
            formData={formData}
            errors={errors}
            onChange={handleFormChange}
            isLoading={loading}
          /> */}
          <FullShopForm
            initialValues={formData}
            onFinish={handleFinish}
          />

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
    </div>
  );
}
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { 
  FaArrowLeft, 
  FaSpinner,
  FaSave,
  FaPlus
} from "react-icons/fa";
import Breadcrumb from "@/components/Breadcrumb";
import { 
  ShopForm, 
  ShopFormData, 
  ShopFormErrors,
  getInitialShopFormData,
  validateShopForm,
  cleanShopFormData
} from "@/components/shop/ShopForm";

export default function NewShopPageExample() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ShopFormData>(getInitialShopFormData());
  const [errors, setErrors] = useState<ShopFormErrors>({});

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
      
      const response = await fetch('/api/lunch/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(`/lunch/shops/${data.shop.id}`);
      } else {
        throw new Error(data.error || '建立商店失敗');
      }
    } catch (error) {
      console.error('Failed to create shop:', error);
      setErrors({
        submit: error instanceof Error ? error.message : '建立商店失敗'
      });
    } finally {
      setLoading(false);
    }
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
          <p className="mb-4">您需要登入才能建立商店</p>
          <Link href="/auth/login" className="btn btn-primary">
            前往登入
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
          { label: '建立商店', current: true }
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
            <FaPlus className="w-8 h-8 text-primary" />
            <span>建立新商店</span>
          </h1>
          <p className="text-base-content/70 mt-1">
            新增餐廳商店資訊
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 使用 ShopForm 組件 */}
          <ShopForm
            formData={formData}
            errors={errors}
            onChange={handleFormChange}
            isLoading={loading}
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
                  建立中...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  建立商店
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
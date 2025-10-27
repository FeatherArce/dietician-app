"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { 
  FaArrowLeft, 
  FaStore, 
  FaSpinner,
  FaSave,
  FaPlus
} from "react-icons/fa";
import Breadcrumb from "@/components/Breadcrumb";

export default function NewShopPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "商店名稱為必填";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "電子郵件格式不正確";
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
      const requestData = {
        ...formData,
        // 清理空字串
        description: formData.description.trim() || null,
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
      };
      
      console.log('Sending request with data:', requestData);
      
      const response = await fetch('/api/lunch/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        router.push(`/lunch/shops/${data.shop.id}`);
      } else {
        console.error('API Error:', data);
        throw new Error(data.error || `建立商店失敗 (狀態碼: ${response.status})`);
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
          {/* 基本資訊 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">基本資訊</h2>
              <div className="grid grid-cols-1 gap-6">
                {/* 商店名稱 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">商店名稱 *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="例如：王家麵店"
                    className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.name}</span>
                    </label>
                  )}
                </div>

                {/* 商店描述 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">商店描述</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="介紹商店特色、招牌菜等..."
                    className="textarea textarea-bordered w-full"
                    rows={3}
                  />
                </div>

                {/* 地址 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">地址</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="例如：台北市中正區羅斯福路一段"
                    className="input input-bordered w-full"
                  />
                </div>

                {/* 電話 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">電話</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="例如：02-1234-5678"
                    className="input input-bordered w-full"
                  />
                </div>

                {/* 電子郵件 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">電子郵件</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="例如：contact@restaurant.com"
                    className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                  />
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.email}</span>
                    </label>
                  )}
                </div>

                {/* 網站 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">網站</span>
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="例如：https://www.restaurant.com"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 營業資訊 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center">
                <FaStore className="w-5 h-5 text-primary" />
                商店設定
              </h2>
              
              {/* 啟用狀態 */}
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-semibold">啟用商店</span>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="checkbox checkbox-primary"
                  />
                </label>
                <label className="label">
                  <span className="label-text-alt">
                    啟用後商店將出現在活動建立的選項中
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
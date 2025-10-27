"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaStore, 
  FaSpinner,
  FaSave
} from "react-icons/fa";
import Breadcrumb from "@/components/Breadcrumb";

interface Shop {
  id: string;
  name: string;
  address?: string;
  is_active: boolean;
}

export default function NewEventPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_deadline: "",
    location: "",
    shop_id: "",
    allow_custom_items: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 獲取商店列表
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('/api/lunch/shops?is_active=true');
        const data = await response.json();
        if (data.success && data.shops) {
          setShops(data.shops);
        }
      } catch (error) {
        console.error('Failed to fetch shops:', error);
      } finally {
        setLoadingShops(false);
      }
    };

    fetchShops();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "活動名稱為必填";
    }

    if (!formData.order_deadline) {
      newErrors.order_deadline = "訂餐截止時間為必填";
    }

    // 檢查截止時間是否合理
    if (formData.order_deadline) {
      const orderDeadline = new Date(formData.order_deadline);
      const now = new Date();

      if (orderDeadline <= now) {
        newErrors.order_deadline = "訂餐截止時間必須在未來";
      }
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
      // 自動計算活動日期：取截止時間的日期部分
      const orderDeadline = new Date(formData.order_deadline);
      const eventDate = new Date(orderDeadline.getFullYear(), orderDeadline.getMonth(), orderDeadline.getDate());
      
      const requestData = {
        ...formData,
        owner_id: user?.id,
        event_date: eventDate.toISOString(),
        order_deadline: orderDeadline.toISOString(),
        // 確保空的 shop_id 不會被發送
        shop_id: formData.shop_id && formData.shop_id.trim() !== '' ? formData.shop_id : undefined,
      };
      
      console.log('Sending request with data:', requestData);
      
      const response = await fetch('/api/lunch/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        router.push(`/lunch/events/${data.event.id}`);
      } else {
        console.error('API Error:', data);
        throw new Error(data.error || `建立活動失敗 (狀態碼: ${response.status})`);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      setErrors({
        submit: error instanceof Error ? error.message : '建立活動失敗'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          <p className="mb-4">您需要登入才能建立訂餐活動</p>
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
          { label: '活動管理', href: '/lunch/events' },
          { label: '建立活動', current: true }
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
            <FaCalendarAlt className="w-8 h-8 text-primary" />
            <span>建立訂餐活動</span>
          </h1>
          <p className="text-base-content/70 mt-1">
            創建新的團體訂餐活動
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">基本資訊</h2>
              
              <div className="grid grid-cols-1 gap-6">
                {/* 活動名稱 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">活動名稱 *</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="例如：明日午餐訂餐"
                    className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                  />
                  {errors.title && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.title}</span>
                    </label>
                  )}
                </div>

                {/* 活動描述 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">活動描述</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="歡迎大家一起訂餐！"
                    className="textarea textarea-bordered w-full"
                    rows={3}
                  />
                </div>

                {/* 訂餐截止時間 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">訂餐截止時間 *</span>
                    <span className="label-text-alt text-base-content/70">活動日期將自動設為截止時間的日期</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="order_deadline"
                    value={formData.order_deadline}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${errors.order_deadline ? 'input-error' : ''}`}
                  />
                  {errors.order_deadline && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.order_deadline}</span>
                    </label>
                  )}
                </div>

                {/* 取餐地點 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">取餐地點</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="例如：公司1樓大廳"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 商店選擇 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center">
                <FaStore className="w-5 h-5 text-primary" />
                選擇商店
              </h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">合作商店</span>
                  <span className="label-text-alt">可選，如不選則允許自訂餐點</span>
                </label>
                <select
                  name="shop_id"
                  value={formData.shop_id}
                  onChange={handleInputChange}
                  className="select select-bordered"
                  disabled={loadingShops}
                >
                  <option value="">不指定商店（允許自訂餐點）</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name} {shop.address && `(${shop.address})`}
                    </option>
                  ))}
                </select>
                {loadingShops && (
                  <label className="label">
                    <span className="label-text-alt">
                      <FaSpinner className="w-3 h-3 animate-spin inline mr-1" />
                      載入商店中...
                    </span>
                  </label>
                )}
              </div>

              {/* 允許自訂餐點 */}
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-semibold">允許自訂餐點</span>
                  <input
                    type="checkbox"
                    name="allow_custom_items"
                    checked={formData.allow_custom_items}
                    onChange={handleInputChange}
                    className="checkbox checkbox-primary"
                  />
                </label>
                <label className="label">
                  <span className="label-text-alt">
                    允許參與者新增商店菜單以外的餐點
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
                  建立活動
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
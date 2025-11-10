"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaStore,
  FaSpinner,
  FaSave,
  FaEdit
} from "react-icons/fa";
import Breadcrumb from "@/components/Breadcrumb";
import { authFetch } from "@/libs/auth-fetch";
import { UserRole } from "@/prisma-generated/postgres-client";
import UnauthorizedView from "@/components/UnauthorizedView";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";

interface Shop {
  id: string;
  name: string;
  address?: string;
  is_active: boolean;
}

interface EventData {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  order_deadline: string;
  location?: string;
  shop_id?: string;
  allow_custom_items: boolean;
  is_active: boolean;
  owner_id: string;
  owner?: {
    id: string;
    name: string;
  };
  shop?: {
    id: string;
    name: string;
    address?: string;
  };
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useSession();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_deadline: "",
    location: "",
    shop_id: "",
    allow_custom_items: false,
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 格式化日期時間為 datetime-local input 格式
  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 獲取活動資料
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/lunch/events/${eventId}`);
        const data = await response.json();

        if (data.success && data.event) {
          const event = data.event;
          setEventData(event);

          setFormData({
            title: event.title,
            description: event.description || "",
            order_deadline: formatDateTimeLocal(event.order_deadline),
            location: event.location || "",
            shop_id: event.shop_id || "",
            allow_custom_items: event.allow_custom_items,
            is_active: event.is_active
          });
        } else {
          throw new Error(data.error || '活動不存在');
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
        setErrors({
          submit: error instanceof Error ? error.message : '載入活動失敗'
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

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
      const response = await authFetch(`/api/lunch/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // 自動計算活動日期：取截止時間的日期部分
          event_date: (() => {
            const orderDeadline = new Date(formData.order_deadline);
            const eventDate = new Date(orderDeadline.getFullYear(), orderDeadline.getMonth(), orderDeadline.getDate());
            return eventDate.toISOString();
          })(),
          order_deadline: new Date(formData.order_deadline).toISOString(),
          // 確保空的 shop_id 不會被發送
          shop_id: formData.shop_id && formData.shop_id.trim() !== '' ? formData.shop_id : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 使用瀏覽器返回上一頁，而不是強制跳轉到詳情頁面
        router.back();
      } else {
        throw new Error(data.error || '更新活動失敗');
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      setErrors({
        submit: error instanceof Error ? error.message : '更新活動失敗'
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
          <p className="mb-4">您需要登入才能編輯訂餐活動</p>
          <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-primary">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">活動不存在</h2>
          <p className="mb-4">找不到指定的活動</p>
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

  const hasEditPermission =
    eventData.owner_id === user?.id ||
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.MODERATOR;

  if (!hasEditPermission) {
    return (
      <UnauthorizedView
        title="權限不足"
        message="只有活動擁有者或管理者可以編輯此活動"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          { label: '活動管理', href: '/lunch/events' },
          { label: eventData.title, href: `/lunch/events/${eventId}` },
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
            <span>編輯活動</span>
          </h1>
          <p className="text-base-content/70 mt-1">
            修改 「{eventData.title}」 的設定
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
                商店設定
              </h2>

              <div className="grid grid-cols-1 gap-6">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">合作商店</span>
                    <span className="label-text-alt">可選，如不選則允許自訂餐點</span>
                  </label>
                  <select
                    name="shop_id"
                    value={formData.shop_id}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
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
                <div className="form-control w-full">
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
                      允許參與者新增菜單以外的餐點
                    </span>
                  </label>
                </div>

                {/* 活動狀態 */}
                <div className="form-control w-full">
                  <label className="label cursor-pointer">
                    <span className="label-text font-semibold">活動狀態</span>
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
                      取消勾選將暫停活動，參與者將無法加入或下單
                    </span>
                  </label>
                </div>
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
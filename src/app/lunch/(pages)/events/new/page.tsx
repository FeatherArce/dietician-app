"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaSpinner,
  FaSave
} from "react-icons/fa";
import Breadcrumb from "@/components/Breadcrumb";
import { Checkbox, Form2, Input, Select } from "@/components/form2";
import { createLunchEvent } from "@/services/client/lunch/lunch-event";
import { Notification } from "@/components/Notification";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";

interface Shop {
  id: string;
  name: string;
  address?: string;
  is_active: boolean;
}

export default function NewEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);

  const initialValues = useMemo(() => ({
    title: "",
    description: "",
    order_deadline: "",
    location: "",
    shop_id: "",
    allow_custom_items: true
  }), []);

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

  const dateParser = useCallback((dateStr: string) => {
    if (!dateStr) return new Date();
    // 將 "YYYY-MM-DDTHH:mm" 轉換為 Date 物件
    const [datePart, timePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }, []);

  const handleFinish = useCallback(async (values: any) => {
    if (!user) {
      Notification.error({ message: '使用者未登入，無法建立活動' });
      return;
    }

    console.log('handleFinish > Form submitted with values:', values);
    setLoading(true);

    try {
      // 自動計算活動日期：取截止時間的日期部分
      const orderDeadline = dateParser(values.order_deadline);
      const eventDate = orderDeadline ? new Date(orderDeadline.getFullYear(), orderDeadline.getMonth(), orderDeadline.getDate()) : null;

      const requestData = {
        ...values,
        owner_id: user?.id,
        event_date: eventDate ? eventDate.toISOString() : null,
        order_deadline: orderDeadline ? orderDeadline.toISOString() : null,
        // 確保空的 shop_id 不會被發送
        shop_id: values.shop_id && values.shop_id.trim() !== '' ? values.shop_id : undefined,
      };

      const res = await createLunchEvent(requestData);
      console.log('API Response:', res);
      if (res.response.ok && res.result.success) {
        Notification.success({ message: '活動建立成功！' });
        router.back();
      } else {
        console.error('API Error:', res.result);
        Notification.error({ message: `建立活動失敗: ${res.result.error || `狀態碼 ${res.response.status}`}` });
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      Notification.error({ message: `建立活動失敗: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setLoading(false);
    }
  }, [user, dateParser, router]);

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
          <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-primary">
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
        <Form2
          initialValues={initialValues}
          onFinish={handleFinish}
          onFinishFailed={(errorInfos) => {
            console.log('Failed:', errorInfos);
          }}
        >
          <Form2.Item
            label="活動名稱"
            name="title"
            rules={[
              { required: true, message: '活動名稱為必填' },
            ]}
          >
            <Input name="title" placeholder="例如：明日午餐訂餐" />
          </Form2.Item>
          <Form2.Item
            label="訂餐截止時間"
            name="order_deadline"
            rules={[
              { required: true, message: '訂餐截止時間為必填' },
              {
                validator: async (value) => {
                  if (value) {
                    const selectedDate = dateParser(String(value));
                    const now = new Date();
                    if (selectedDate <= now) {
                      return '訂餐截止時間必須在未來';
                    }
                  }
                  return '';
                }
              }
            ]
            }
          >
            <Input type="datetime-local" name="order_deadline" />
          </Form2.Item>
          <Form2.Item
            label="活動描述"
            name="description"
          >
            <Input name="description" placeholder="歡迎大家一起訂餐！" />
          </Form2.Item>
          <Form2.Item
            label="取餐地點"
            name="location"
          >
            <Input name="location" placeholder="例如：公司1樓大廳" />
          </Form2.Item>
          <Form2.Item
            label="商店"
            name="shop_id"
          >
            <Select
              placeholder="選擇商店"
              disabled={loadingShops}
              options={(shops.map(shop => ({ value: shop.id, label: shop.address ? `${shop.name} (${shop.address})` : shop.name })))}
            />
          </Form2.Item>
          <Form2.Item
            label="允許自訂餐點"
            name="allow_custom_items"
            valuePropName="checked"
          >
            <Checkbox
              label="允許參與者新增菜單以外的餐點"
            />
          </Form2.Item>

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
        </Form2>
      </div>
    </div>
  );
}
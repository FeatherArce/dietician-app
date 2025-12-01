"use client";
import LunchEventForm, { parseDatetimeLocalString } from "@/app/lunch/_components/LunchEventForm";
import Breadcrumb, { lunchBreadcrumbHomeItem } from "@/components/Breadcrumb";
import { Notification } from "@/components/Notification";
import PageAuthBlocker from "@/components/page/PageAuthBlocker";
import { toast } from "@/components/Toast";
import { createLunchEvent } from "@/data-access/lunch/lunch-event";
import moment from "moment-timezone";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt
} from "react-icons/fa";


export default function NewEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const [loading, setLoading] = useState(false);

  const initialValues = useMemo(() => ({
    title: "",
    description: "",
    order_deadline: "",
    location: "",
    shop_id: "",
    allow_custom_items: true
  }), []);

  const handleFinish = useCallback(async (values: any) => {
    console.log('handleFinish > Form submitted with values:', values);
    setLoading(true);
    try {
      // 自動計算活動日期：取截止時間的日期部分
      const orderDeadline = parseDatetimeLocalString(values.order_deadline);

      const timezone = moment.tz.guess();
      const momentOrderDeadline = values.order_deadline ? moment.tz(orderDeadline, timezone) : null;
      const eventDate = momentOrderDeadline ? momentOrderDeadline.format('YYYY-MM-DD') : null;
      const iso8601OrderDeadline = momentOrderDeadline ? momentOrderDeadline.toISOString() : null;

      const requestData = {
        ...values,
        owner_id: user?.id,
        event_date: eventDate,
        order_deadline: iso8601OrderDeadline,
        // 確保空的 shop_id 不會被發送
        shop_id: values.shop_id && values.shop_id.trim() !== '' ? values.shop_id : undefined,
      };

      const res = await createLunchEvent(requestData);
      console.log('API Response:', res);
      if (!res.response.ok || !res.result.success) {
        throw new Error(res.result.error || `狀態碼 ${res.response.status}`);
      }

      toast.success('活動建立成功！');
      router.back();
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error(`建立活動失敗: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }, [user, router]);

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
      <PageAuthBlocker
        description='您需要登入才能建立訂餐活動'
        loading={authLoading}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          lunchBreadcrumbHomeItem,
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
        <LunchEventForm
          loading={loading}
          initialValues={initialValues}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
}
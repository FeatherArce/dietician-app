"use client";
import LunchEventForm from "@/app/lunch/_components/LunchEventForm";
import Breadcrumb, { lunchBreadcrumbHomeItem } from "@/components/Breadcrumb";
import { FormValues } from "@/components/form";
import PageAuthBlocker from "@/components/page/PageAuthBlocker";
import { toast } from "@/components/Toast";
import { UserRole } from "@/prisma-generated/postgres-client";
import { getLunchEventById, updateLunchEvent } from "@/data-access/lunch/lunch-event";
import { ILunchEvent } from "@/types/LunchEvent";
import moment from "moment-timezone";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  FaArrowLeft,
  FaEdit
} from "react-icons/fa";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuthenticated = status === "authenticated";
  const authLoading = status === "loading";

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<ILunchEvent | undefined>();

  const hasEditPermission = useMemo(() => {
    return (
      eventData?.owner_id === user?.id ||
      user?.role === UserRole.ADMIN ||
      user?.role === UserRole.MODERATOR
    );
  }, [eventData, user]);

  const getLunchEvent = useCallback(async () => {
    try {
      const { response, result } = await getLunchEventById(eventId);
      console.log('getLunchEventById > API Response:', response, result);
      const event = result.data?.event;
      if (!response.ok && !result.success && !event) {
        toast.error('無法取得活動資料');
        router.back();
        return;
      }
      setEventData(event);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast.error(`無法取得活動資料: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [eventId, router]);

  // 獲取活動資料
  useEffect(() => {
    startTransition(() => {
      getLunchEvent();
    });
  }, [getLunchEvent]);

  const handleSubmit = useCallback(async (values: FormValues) => {
    if (!eventId) {
      toast.error('活動ID不存在，無法更新活動');
      return;
    }
    if (!hasEditPermission) {
      toast.error('您沒有權限編輯此活動');
      return;
    }

    // 把時間字串補充成完整的 ISO 8601 並帶有時區資訊
    if (values.order_deadline) {
      const rawOrderDeadline = values.order_deadline as string;
      const orderDeadlineWithTZ = moment(rawOrderDeadline).tz('Asia/Taipei').format();
      console.log('Converted order_deadline with timezone:', {
        before: rawOrderDeadline,
        after: orderDeadlineWithTZ
      });
      values.order_deadline = orderDeadlineWithTZ;
    }

    setLoading(true);
    try {
      const { response, result } = await updateLunchEvent(eventId, values);

      if (!response.ok || !result.success) {
        throw new Error(result.message || `更新活動失敗 (狀態碼: ${response.status})`);
      }

      toast.success('活動更新成功！');
      router.back();
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error(`更新活動失敗: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }, [eventId, router, hasEditPermission]);

  if (authLoading || isPending) {
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
        description='您需要登入才能編輯訂餐活動'
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
          { label: eventData?.title || '不明活動', href: `/lunch/events/${eventId}` },
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
            修改 「{eventData?.title || '不明活動'}」 的設定
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <LunchEventForm
          initialValues={eventData}
          loading={loading || isPending}
          onFinish={handleSubmit}
        />
      </div>
    </div>
  );
}
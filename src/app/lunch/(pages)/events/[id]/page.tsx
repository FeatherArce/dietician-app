"use client";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { authFetch } from "@/libs/auth-fetch";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaDownload,
  FaEdit,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaStore,
  FaToggleOff,
  FaToggleOn,
  FaUsers
} from "react-icons/fa";
import EventOrderSummaryTable, { EventOrderSummaryTableRef } from "../../../_components/EventOrderSummaryTable";
import { getLunchEventById, updateLunchEvent } from "@/services/client/lunch/lunch-event";
import { toast } from "@/components/Toast";
import { ILunchEvent, ILunchOrder } from "@/types/LunchEvent";
import { UserRole } from "@/prisma-generated/postgres-client";

// interface EventWithSummary extends EventWithDetails {
//   orderCount: number;
//   totalAmount: number;
//   participantCount: number;
//   itemSummary: Array<ItemSummary>;
// }

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const [event, setEvent] = useState<ILunchEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isPaymentPending, startPaymentTransition] = useState(false);

  const eventTableRef = useRef<EventOrderSummaryTableRef>(null);

  const canEdit = useMemo(() => {
    return event?.owner_id === user?.id || user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR
  }, [event, user]);

  const fetchEvent = useCallback(async () => {
    try {
      if (!eventId) return;
      const { response, result } = await getLunchEventById(eventId);
      if (response.ok && result.success && result.data?.event) {
        setEvent(result.data?.event);
      } else {
        router.push("/lunch/events");
      }
    } catch (error) {
      console.error("Failed to fetch event:", error);
      router.push("/lunch/events");
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const toggleEventStatus = useCallback(async () => {
    if (!event) return;

    setUpdating(true);
    try {
      const { response, result } = await updateLunchEvent(eventId, { is_active: !event.is_active });

      if (response.ok && result.success) {
        toast.success(`活動已${event.is_active ? '關閉' : '開啟'}！`);
        await fetchEvent();
      }
    } catch (error) {
      console.error("Failed to update event status:", error);
    } finally {
      setUpdating(false);
    }
  }, [event, eventId, fetchEvent]);

  // 處理收款狀態變更
  const handlePaymentStatusChange = async (orderId: string, isPaid: boolean) => {
    try {
      startPaymentTransition(true);
      const response = await authFetch(`/api/lunch/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_paid: isPaid,
          paid_at: isPaid ? new Date().toISOString() : null,
          paid_method: isPaid ? "現金" : null  // 預設收款方式，可以之後改為可選擇
        }),
      });

      if (response.ok) {
        // 重新載入事件資料以更新收款狀態
        await fetchEvent();
      } else {
        console.error("Failed to update payment status");
        // 可以加入錯誤提示
        toast.error("更新收款狀態失敗，請稍後再試。");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("更新收款狀態發生錯誤，請稍後再試。" + error);
    } finally {
      startPaymentTransition(false);
    }
  };

  const getStatusBadge = () => {
    if (!event) return null;

    const now = new Date();
    const orderDeadline = new Date(event.order_deadline);

    if (!event.is_active) {
      return <span className="badge badge-error">已關閉</span>;
    }

    if (orderDeadline < now) {
      return <span className="badge badge-warning">訂餐結束</span>;
    }

    return <span className="badge badge-success">進行中</span>;
  };

  const paidState = useMemo(() => {
    const totalOrders = event?._count?.orders || event?.orders?.length || 0;
    const paidOrders = event?.orders?.filter(order => order.is_paid).length || 0;
    const unpaidOrders = totalOrders - paidOrders;

    return { totalOrders, paidOrders, unpaidOrders }
  }, [event]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">找不到活動</h2>
          <button
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            返回上一頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 grid gap-6">
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          { label: '活動管理', href: '/lunch/events' },
          { label: event.title, current: true }
        ]}
      />

      {/* 頁面標題和操作 */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-circle"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <FaCalendarAlt className="w-8 h-8 text-primary" />
              <span>{event.title}</span>
              {getStatusBadge()}
            </h1>
            <p className="text-base-content/70 mt-1">
              活動詳細資料與訂單管理
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {/* 只有活動擁有者才能看到編輯和狀態控制按鈕 */}
          {canEdit && (
            <>
              <Link
                href={`/lunch/events/${eventId}/edit`}
                className="btn btn-ghost"
              >
                <FaEdit className="w-4 h-4" />
                編輯
              </Link>
              <button
                className={`btn ${event.is_active ? "btn-error" : "btn-success"}`}
                onClick={toggleEventStatus}
                disabled={updating}
              >
                {updating ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : event.is_active ? (
                  <>
                    <FaToggleOff className="w-4 h-4" />
                    關閉活動
                  </>
                ) : (
                  <>
                    <FaToggleOn className="w-4 h-4" />
                    開啟活動
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-primary">
            <FaShoppingCart className="w-8 h-8" />
          </div>
          <div className="stat-title">訂單數量</div>
          <div className="stat-value text-primary">{event._count?.orders}</div>
          <div className="stat-desc">總訂單數</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-secondary">
            <FaUsers className="w-8 h-8" />
          </div>
          <div className="stat-title">參與人數</div>
          <div className="stat-value text-secondary">{event._count?.attendees}</div>
          <div className="stat-desc">下單人數</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-accent">
            <FaDollarSign className="w-8 h-8" />
          </div>
          <div className="stat-title">總金額</div>
          <div className="stat-value text-accent">${event._count?.total_amount}</div>
          <div className="stat-desc">累計消費</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">收款狀態</div>
          <div className="stat-value">
            {paidState.unpaidOrders > 0 ? (<>
              <span className="text-red-500">
                {paidState.unpaidOrders}
              </span>
              <span> / </span>
              <span>{paidState.paidOrders}</span>
            </>) : (<>
              <span className="text-green-500">全部已收款</span>
            </>)}
          </div>
          <div className="stat-desc">
            {paidState.unpaidOrders > 0 ? (<>
              <span className="text-red-500">未收款</span>
              <span> / </span>
              <span>已收款</span>
            </>) : (<>

            </>)}
          </div>
        </div>
      </div>

      {/* 活動資訊 */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold">活動資訊</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* <div>
            <label className="text-sm text-base-content/70">活動名稱</label>
            <div className="font-semibold">{event.title}</div>
          </div>

          {event.description && (
            <div>
              <label className="text-sm text-base-content/70">活動描述</label>
              <div className="text-base-content/80">{event.description}</div>
            </div>
          )} */}

          <div>
            <label className="text-sm text-base-content/70">主辦人</label>
            <div>
              {event.owner ? (
                <span className="font-medium">{event.owner.name}</span>
              ) : (
                "未知"
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold">商店資訊</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaStore className="w-5 h-5 text-primary" />
                <div>
                  <span className="font-semibold">{event.shop?.name}</span>
                </div>
              </div>

              {event.shop?.address && (
                <div>
                  <label className="text-sm text-base-content/70">地址</label>
                  <div className="text-base-content/80">{event.shop.address}</div>
                </div>
              )}

              {event.shop?.phone && (
                <div>
                  <label className="text-sm text-base-content/70">電話</label>
                  <div className="text-base-content/80">{event.shop.phone}</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-base-content/70">活動日期</label>
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="w-4 h-4 text-primary" />
              <span>{new Date(event.event_date).toLocaleDateString("zh-TW")}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-base-content/70">訂餐截止</label>
            <div className="flex items-center space-x-2">
              <FaClock className="w-4 h-4 text-warning" />
              <span>{new Date(event.order_deadline).toLocaleString("zh-TW")}</span>
            </div>
          </div>

          {event.location && (
            <div>
              <label className="text-sm text-base-content/70">取餐地點</label>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="w-4 h-4 text-secondary" />
                <span>{event.location}</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* divider */}
      <hr className=" border-gray-500" />

      {/* 訂單 */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">訂單</h3>
          <button className="btn btn-ghost">
            <FaDownload className="w-4 h-4" />
            匯出
          </button>
        </div>

        <div className="overflow-x-auto">
          <DataTable<ILunchOrder>
            dataSource={event.orders || []}
            columns={[
              { key: 'id', title: '訂單編號', render: (value, order) => String(value).slice(-8) },
              { key: 'user', title: '使用者', render: (value, order) => order.user?.name || '未知' },
              {
                key: 'items',
                title: '餐點內容',
                render: (value, order) => (
                  <div className="max-w-xs">
                    {order.items.length > 0 ? (
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-xs">
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-gray-500">
                            等 {order.items.length} 項餐點
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">無餐點</span>
                    )}
                  </div>
                )
              },
              { key: 'totalItems', title: '項目數', render: (value, order) => order.items.length + ' 項' },
              { key: 'total', title: '金額', render: (value) => `$${value}` },
              {
                key: 'is_paid', title: '收款狀態', render: (value, order) => (
                  <>
                    {/* 只有活動擁有者才能修改收款狀態 */}
                    {canEdit ? (
                      <div className="flex items-center space-x-2">
                        {isPaymentPending ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <input
                            type="checkbox"
                            className="checkbox checkbox-success checkbox-sm"
                            checked={(order as any).is_paid || false}
                            disabled={isPaymentPending}
                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.checked)}
                          />
                        )}
                        <span className={`badge badge-sm ${(order as any).is_paid ? 'badge-success' : 'badge-warning'}`}>
                          {(order as any).is_paid ? '已收款' : '未收款'}
                        </span>
                      </div>
                    ) : (
                      <span className={`badge badge-sm ${(order as any).is_paid ? 'badge-success' : 'badge-warning'}`}>
                        {(order as any).is_paid ? '已收款' : '未收款'}
                      </span>
                    )}
                  </>
                )
              },
              { key: 'created_at', title: '下單時間', render: (value) => new Date(String(value)).toLocaleString("zh-TW") },
              { key: 'note', title: '備註', render: (value, record) => String(value) || "-" },
              {
                key: 'actions', title: '操作', render: (value, order) => (
                  <>

                  </>
                )
              },
            ]}
          />
        </div>
      </div>

      {/* divider */}
      <hr className=" border-gray-500" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">訂單明細</h3>

          <button
            title="下載統計報告"
            className="btn btn-sm btn-outline btn-primary"
            onClick={() => {
              eventTableRef.current?.download();
            }}
          >
            <FaDownload />
          </button>
        </div>

        <EventOrderSummaryTable
          ref={eventTableRef}
          showStatistics={false}
          event={event}
          className="w-full"
        />
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { 
  FaArrowLeft, 
  FaEdit, 
  FaCalendarAlt, 
  FaToggleOn, 
  FaToggleOff,
  FaClock,
  FaMapMarkerAlt,
  FaStore,
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
  FaEye,
  FaDownload
} from "react-icons/fa";
import { LunchEvent } from "@/prisma-generated/postgres-client";
import Breadcrumb from "@/components/Breadcrumb";
import EventStatistics from "../../../_components/EventStatistics";
import OrderDetailModal from "./_components/OrderDetailModal";
import type { EventStatistics as EventStatisticsType } from "../../../types";

interface EventWithDetails extends LunchEvent {
  orderCount: number;
  totalAmount: number;
  participantCount: number;
  shop?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
  owner?: {
    id: string;
    name: string;
  };
  orders: Array<{
    id: string;
    total: number;
    note?: string;
    created_at: Date;
    // 收款相關欄位
    is_paid?: boolean;
    paid_at?: Date;
    paid_method?: string;
    paid_note?: string;
    user: {
      id: string;
      name: string;
    };
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      note?: string;
    }>;
  }>;
  itemSummary: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
    orders: number;
  }>;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { user } = useAuthStore();
  
  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "summary">("overview");
  const [selectedOrder, setSelectedOrder] = useState<EventWithDetails['orders'][0] | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/lunch/events/${eventId}?include=details`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
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
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  const toggleEventStatus = async () => {
    if (!event) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/lunch/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !event.is_active }),
      });

      if (response.ok) {
        await fetchEvent();
      }
    } catch (error) {
      console.error("Failed to update event status:", error);
    } finally {
      setUpdating(false);
    }
  };

  // 處理收款狀態變更
  const handlePaymentStatusChange = async (orderId: string, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/lunch/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('auth-token')}`,
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
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  // 轉換事件資料為統計格式
  const getEventStatistics = (): EventStatisticsType | null => {
    if (!event) return null;
    
    // 從訂單資料中生成餐點統計
    const itemMap = new Map();
    const participantSet = new Set();
    
    for (const order of event.orders || []) {
      participantSet.add(order.user.id);
      
      for (const item of order.items || []) {
        const key = item.name;
        if (itemMap.has(key)) {
          const existing = itemMap.get(key);
          existing.quantity += item.quantity;
          existing.totalPrice += item.price * item.quantity;
          existing.orders += 1;
          existing.orderUsers.add(order.user.name);
          existing.orderDetails.push({
            userName: order.user.name,
            quantity: item.quantity,
            orderNote: order.note || undefined,
            itemNote: item.note || undefined,
            price: item.price
          });
        } else {
          itemMap.set(key, {
            name: item.name,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
            orders: 1,
            orderUsers: new Set([order.user.name]),
            orderDetails: [{
              userName: order.user.name,
              quantity: item.quantity,
              orderNote: order.note || undefined,
              itemNote: item.note || undefined,
              price: item.price
            }]
          });
        }
      }
    }
    
    // 轉換餐點統計格式
    const itemSummary = Array.from(itemMap.values()).map(item => ({
      name: item.name,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      orders: item.orders,
      orderUsers: Array.from(item.orderUsers) as string[],
      orderDetails: item.orderDetails
    }));
    
    return {
      id: event.id, // 加入必要的 id 字段
      shop: event.shop,
      totalOrders: event.orderCount || event.orders?.length || 0,
      totalAmount: event.totalAmount || (event.orders?.reduce((sum, order) => sum + order.total, 0) || 0),
      participantCount: event.participantCount || participantSet.size,
      orders: (event.orders || []).map(order => ({
        id: order.id,
        total: order.total,
        note: order.note || undefined,
        created_at: order.created_at,
        user: order.user,
        items: (order.items || []).map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          note: item.note || undefined
        }))
      })),
      itemSummary
    };
  };

  // 打開訂單詳細 modal
  const openOrderModal = (order: EventWithDetails['orders'][0]) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // 關閉訂單詳細 modal
  const closeOrderModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
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
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <Breadcrumb 
        items={[
          { label: '活動管理', href: '/lunch/events' },
          { label: event.title, current: true }
        ]} 
      />

      {/* 頁面標題和操作 */}
      <div className="flex justify-between items-start mb-6">
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
          {event.owner_id === user?.id && (
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

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-primary">
            <FaShoppingCart className="w-8 h-8" />
          </div>
          <div className="stat-title">訂單數量</div>
          <div className="stat-value text-primary">{event.orderCount}</div>
          <div className="stat-desc">總訂單數</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-secondary">
            <FaUsers className="w-8 h-8" />
          </div>
          <div className="stat-title">參與人數</div>
          <div className="stat-value text-secondary">{event.participantCount}</div>
          <div className="stat-desc">下單人數</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-accent">
            <FaDollarSign className="w-8 h-8" />
          </div>
          <div className="stat-title">總金額</div>
          <div className="stat-value text-accent">${event.totalAmount}</div>
          <div className="stat-desc">累計消費</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-title">平均訂單</div>
          <div className="stat-value">
            ${event.orderCount > 0 ? (event.totalAmount / event.orderCount).toFixed(0) : 0}
          </div>
          <div className="stat-desc">每筆訂單平均</div>
        </div>
      </div>

      {/* 頁籤切換 */}
      <div className="tabs tabs-box mb-6">
        <button 
          className={`tab p-2 ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          活動資訊
        </button>
        <button 
          className={`tab p-2 ${activeTab === "orders" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          訂單列表
        </button>
        <button 
          className={`tab p-2 ${activeTab === "summary" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          統計報表
        </button>
      </div>

      {/* 內容區域 */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本資料 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">活動資訊</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-base-content/70">活動名稱</label>
                  <div className="font-semibold">{event.title}</div>
                </div>

                {event.description && (
                  <div>
                    <label className="text-sm text-base-content/70">活動描述</label>
                    <div className="text-base-content/80">{event.description}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
          </div>

          {/* 商店資訊 */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">商店資訊</h3>
              
              {event.shop ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaStore className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-semibold">{event.shop.name}</span>
                    </div>
                  </div>

                  {event.shop.address && (
                    <div>
                      <label className="text-sm text-base-content/70">地址</label>
                      <div className="text-base-content/80">{event.shop.address}</div>
                    </div>
                  )}

                  {event.shop.phone && (
                    <div>
                      <label className="text-sm text-base-content/70">電話</label>
                      <div className="text-base-content/80">{event.shop.phone}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/70">
                  未指定商店
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">訂單列表</h3>
            <button className="btn btn-ghost">
              <FaDownload className="w-4 h-4" />
              匯出
            </button>
          </div>

          {event.orders && event.orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>訂單編號</th>
                    <th>使用者</th>
                    <th>餐點內容</th>
                    <th>項目數</th>
                    <th>金額</th>
                    <th>收款狀態</th>
                    <th>下單時間</th>
                    <th>備註</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {event.orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        {order.id.slice(-8)}
                      </td>
                      <td>
                        {order.user.name}
                      </td>
                      <td>
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
                      </td>
                      <td>{order.items.length} 項</td>
                      <td>${order.total}</td>
                      <td>
                        {/* 只有活動擁有者才能修改收款狀態 */}
                        {event.owner_id === user?.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-success checkbox-sm"
                              checked={(order as any).is_paid || false}
                              onChange={(e) => handlePaymentStatusChange(order.id, e.target.checked)}
                            />
                            <span className={`badge badge-sm ${(order as any).is_paid ? 'badge-success' : 'badge-warning'}`}>
                              {(order as any).is_paid ? '已收款' : '未收款'}
                            </span>
                          </div>
                        ) : (
                          <span className={`badge badge-sm ${(order as any).is_paid ? 'badge-success' : 'badge-warning'}`}>
                            {(order as any).is_paid ? '已收款' : '未收款'}
                          </span>
                        )}
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleString("zh-TW")}
                      </td>
                      <td>{order.note || "-"}</td>
                      <td>
                        <button
                          onClick={() => openOrderModal(order)}
                          className="btn btn-primary btn-sm"
                          title="查看餐點詳細"
                        >
                          <FaEye className="w-3 h-3" />
                          查看詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaShoppingCart className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
              <h4 className="text-lg font-semibold mb-2">尚無訂單</h4>
              <p className="text-base-content/70">等待使用者下單</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "summary" && (
        <div>
          {event && getEventStatistics() ? (
            <EventStatistics 
              statistics={getEventStatistics()!} 
              className="w-full"
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto text-base-content/30 mb-4">📊</div>
              <h4 className="text-lg font-semibold mb-2">尚無統計資料</h4>
              <p className="text-base-content/70">需要有訂單才能產生統計</p>
            </div>
          )}
        </div>
      )}

      {/* 訂單詳細 Modal */}
      <OrderDetailModal
        isOpen={showOrderModal}
        onClose={closeOrderModal}
        order={selectedOrder}
      />
    </div>
  );
}
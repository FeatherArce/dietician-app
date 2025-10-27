"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaCheck,
  FaClock,
  FaUsers,
  FaStore,
  FaUtensils,
} from "react-icons/fa";
import Breadcrumb from "@/components/Breadcrumb";
import Tabs from "@/components/Tabs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { EventData, EventMenuItem, EventMenu, EventMenuCategory } from "@/types/LunchEvent";
import MenuMealForm from "./_components/MenuMealForm";
import CustomMealForm from "./_components/CustomMealForm";
import { notification } from "@/components/Notification";

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  description?: string;
  category_name?: string;
  menu_item_id?: string;
}

interface ExistingOrder {
  id: string;
  total: number;
  note?: string;
  items: OrderItem[];
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [event, setEvent] = useState<EventData | null>(null);
  const [existingOrder, setExistingOrder] = useState<ExistingOrder | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderNote, setOrderNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventId, setEventId] = useState<string>("");
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<EventMenuItem | null>(null);

  // 解析動態參數
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // 獲取事件資料
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        const response = await fetch(`/api/lunch/events/${eventId}`);
        const data = await response.json();

        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          throw new Error(data.error || "活動不存在");
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
        alert("無法載入活動資料");
        router.back();
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, router]);

  // 獲取現有訂單
  useEffect(() => {
    const fetchExistingOrder = async () => {
      if (!user?.id || !eventId) return;

      try {
        const response = await fetch(`/api/lunch/orders/user/${user.id}/event/${eventId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('auth-token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.order) {
            setExistingOrder(data.order);
            setOrderItems(data.order.items || []);
            setOrderNote(data.order.note || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch existing order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && event) {
      fetchExistingOrder();
    }
  }, [user, event, eventId]);

  // 檢查是否可以訂餐
  const canOrder = () => {
    if (!event) return false;
    if (!event.is_active) return false;

    const orderDeadline = new Date(event.order_deadline);
    const now = new Date();
    return now <= orderDeadline;
  };

  // 開啟菜單項目設定視窗
  const openMenuForm = (menuItem: EventMenuItem) => {
    setSelectedMenuItem(menuItem);
    setShowMenuForm(true);
  };

  // 開啟客製化項目設定視窗
  const openCustomForm = () => {
    setShowCustomForm(true);
  };

  // 處理菜單餐點提交
  const handleMenuItemSubmit = (data: {
    name: string;
    price: number;
    quantity: number;
    note: string;
    description?: string;
    menu_item_id?: string;
  }) => {
    const newOrderItem: OrderItem = {
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      description: data.description,
      note: data.note,
      menu_item_id: data.menu_item_id,
    };

    setOrderItems([...orderItems, newOrderItem]);
    setShowMenuForm(false);
    setSelectedMenuItem(null);
  };

  // 處理自訂餐點提交
  const handleCustomItemSubmit = (data: {
    name: string;
    price: number;
    quantity: number;
    note: string;
    description?: string;
  }) => {
    const newOrderItem: OrderItem = {
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      description: data.description,
      note: data.note,
      menu_item_id: undefined,
    };

    setOrderItems([...orderItems, newOrderItem]);
    setShowCustomForm(false);
  };

  // 關閉表單視窗
  const closeMenuForm = () => {
    setShowMenuForm(false);
    setSelectedMenuItem(null);
  };

  const closeCustomForm = () => {
    setShowCustomForm(false);
  };

  // Form2 處理函數
  const handleMenuFormSubmit = (data: {
    name: string;
    price: number;
    quantity: number;
    note: string;
    description?: string;
    menu_item_id?: string;
  }) => {
    const orderItem: OrderItem = {
      id: data.menu_item_id,
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      note: data.note,
      description: data.description,
    };
    setOrderItems([...orderItems, orderItem]);
    closeMenuForm();
  };

  const handleCustomFormSubmit = (data: {
    name: string;
    price: number;
    quantity: number;
    note: string;
    description?: string;
  }) => {
    const orderItem: OrderItem = {
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      note: data.note,
      description: data.description,
    };
    setOrderItems([...orderItems, orderItem]);
    closeCustomForm();
  };

  // 更新項目數量
  const updateItemQuantity = (index: number, change: number) => {
    setOrderItems(orderItems.map((item, i) => {
      if (i === index) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  // 移除項目
  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // 計算總金額
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // 提交訂單
  const submitOrder = async () => {
    if (!user || !event) return;

    if (orderItems.length === 0) {
      alert("請至少選擇一個餐點");
      return;
    }

    setSubmitting(true);
    try {
      const method = existingOrder ? "PUT" : "POST";
      const url = `/api/lunch/orders`;

      // 準備訂單項目數據，符合 API 預期格式
      const items = orderItems.map(item => ({
        type: item.menu_item_id ? 'MENU_ITEM' : 'CUSTOM',
        menu_item_id: item.menu_item_id || undefined,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        note: item.note || undefined, // 添加餐點備註
        description: item.description || undefined
      }));

      const payload = existingOrder
        ? {
          id: existingOrder.id,
          items,
          note: orderNote,
          total: calculateTotal()
        }
        : {
          event_id: eventId,
          items,
          note: orderNote,
          total: calculateTotal()
        };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        notification.success({
          message: existingOrder ? "訂單已更新！" : "訂單已提交！",
        });
        // 使用瀏覽器返回上一頁，而不是強制跳轉到特定頁面
        router.back();
      } else {
        throw new Error(data.error || "提交失敗");
      }
    } catch (error) {
      console.error("Failed to submit order:", error);
      notification.error({
        message: "提交訂單失敗：" + (error as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const tabMenus = useMemo(() => {
    const newMenus: Array<EventMenu> = [];
    (event?.shop?.menus || []).forEach((menu) => {
      const newMenu: EventMenu = { ...menu, categories: [], items: [] };
      const categoryMap = new Map<string, EventMenuCategory>();

      categoryMap.set('default', {
        id: 'default',
        name: '預設',
        description: '',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        menu_id: '',
        sort_order: 0,
        items: []
      });
      (menu.items || []).forEach((item) => {
        if (!item.category_id) {
          const defaultCategory = categoryMap.get('default');
          if (defaultCategory) {
            if (!defaultCategory.items) {
              defaultCategory.items = [];
            }
            defaultCategory.items?.push(item);
          }
        }
      });

      (menu.categories || []).forEach((category) => {
        categoryMap.set(category.id, category);
      });

      newMenu.categories = Array.from(categoryMap.values());
      newMenus.push(newMenu);
    });

    console.log("Generating tabs", { menus: event?.shop?.menus, newMenus });
    return newMenus;
  }, [event]);

  const TabMenuContent = ({ category }: { category: EventMenuCategory }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {category.items.map(item => (
          <div
            key={item.id}
            className={`card border cursor-pointer transition-all hover:shadow-md ${!item.is_available ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
              }`}
            onClick={() => item.is_available && openMenuForm(item)}
          >
            <div className="card-body p-4">
              <h4 className="font-semibold text-sm">{item.name}</h4>
              {item.description && (
                <p className="text-xs text-base-content/70 mb-2">{item.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-primary font-bold">${item.price}</span>
                <div className={`badge badge-sm ${item.is_available ? 'badge-success' : 'badge-error'}`}>
                  {item.is_available ? '供應中' : '停售'}
                </div>
              </div>
            </div>
          </div>
        ))}
        {category.items.length === 0 && (
          <div className="col-span-full text-center py-8 text-base-content/50">
            此分類暫無餐點
          </div>
        )}
      </div>
    );
  }

  if (isLoading || loading) {
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
          <p className="mb-4">您需要登入才能參與訂餐</p>
          <Link href="/auth/login" className="btn btn-primary">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">活動不存在</h2>
          <button onClick={() => router.back()} className="btn btn-primary">
            返回
          </button>
        </div>
      </div>
    );
  }

  if (!canOrder()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <FaClock className="w-12 h-12 mx-auto text-error mb-4" />
          <h2 className="text-2xl font-bold mb-4">無法訂餐</h2>
          <p className="mb-4">
            {!event.is_active
              ? "此活動已關閉"
              : "訂餐期限已過"}
          </p>
          <button onClick={() => router.back()} className="btn btn-primary">
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
          { label: '午餐系統', href: '/lunch' },
          { label: event.title, href: `/lunch/events/${eventId}` },
          { label: '參與訂餐', current: true }
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
            <FaShoppingCart className="w-8 h-8 text-primary" />
            <span>參與訂餐</span>
          </h1>
          <p className="text-base-content/70 mt-1">
            {event.title} - {existingOrder ? "修改訂單" : "新增訂單"}
          </p>
        </div>
      </div>

      {/* 活動資訊卡片 */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <FaClock className="w-4 h-4 text-warning" />
              <span>截止：{new Date(event.order_deadline).toLocaleString("zh-TW")}</span>
            </div>
            {event.shop && (
              <div className="flex items-center space-x-2">
                <FaStore className="w-4 h-4 text-info" />
                <span>{event.shop.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <FaUsers className="w-4 h-4 text-secondary" />
              <span>主辦：{event.owner.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：菜單選擇 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h3 className="card-title">菜單</h3>
                {event.allow_custom_items && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={openCustomForm}
                  >
                    <FaPlus className="w-3 h-3 mr-1" />
                    自訂餐點
                  </button>
                )}
              </div>
              <p className="text-gray-500">請選擇您想要的餐點，若餐點不在菜單上，請透過 &quot;自訂餐點&quot; 功能新增。</p>

              {tabMenus?.length > 0 ? (
                tabMenus?.map((menu, index) => (
                  <Tabs
                    key={`tab-menu-${index}`}
                    items={(menu?.categories || []).map(category => ({
                      id: category.id,
                      label: category.name,
                      icon: <FaUtensils className="w-3 h-3 mr-1" />,
                      content: (
                        <TabMenuContent category={category} />
                      )
                    }))}
                    variant="boxed"
                  />
                ))
              ) : (
                <div className="text-center py-8 text-base-content/50">
                  <FaUtensils className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>此活動尚未設定菜單</p>
                  {event.allow_custom_items && (
                    <p className="mt-2">您可以使用上方的「自訂餐點」按鈕新增項目</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側：訂單摘要 */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-sm sticky top-4">
            <div className="card-body">
              <h3 className="card-title">訂單摘要</h3>

              {/* 訂單項目 */}
              <div className="space-y-3">
                <div className="form-control vertical">
                  <label className="label">
                    <span className="label-text">訂單項目</span>
                  </label>
                </div>
                {orderItems.length === 0 ? (
                  <p className="text-base-content/70 text-center py-4">尚未選擇餐點</p>
                ) : (
                  orderItems.map((item, index) => (
                    <div key={index} className="border border-base-300 rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h6 className="font-medium">{item.name}</h6>
                          <p className="text-sm text-base-content/70">${item.price} × {item.quantity} = ${item.price * item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => updateItemQuantity(index, -1)}
                          >
                            <FaMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => updateItemQuantity(index, 1)}
                          >
                            <FaPlus className="w-3 h-3" />
                          </button>
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => removeItem(index)}
                          >
                            <RiDeleteBin6Line className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-sm">餐點備註</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered input-xs"
                          value={item.note || ""}
                          onChange={(e) => setOrderItems(orderItems.map((orderItem, i) =>
                            i === index ? { ...orderItem, note: e.target.value } : orderItem
                          ))}
                          placeholder="餐點備註 (例：不要辣、加蛋...)"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 備註 */}
              <div className="form-control vertical">
                <label className="label">
                  <span className="label-text">訂單備註</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="特殊需求或備註..."
                  rows={3}
                />
              </div>

              {/* 總計 */}
              <div className="divider"></div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>總計：</span>
                <span className="text-primary">${calculateTotal()}</span>
              </div>

              {/* 提交按鈕 */}
              <button
                className="btn btn-primary w-full"
                onClick={submitOrder}
                disabled={submitting || orderItems.length === 0}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <FaCheck className="w-4 h-4" />
                    {existingOrder ? "更新訂單" : "提交訂單"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form2 組件 */}
      {showMenuForm && selectedMenuItem && (
        <MenuMealForm
          menuItem={{
            ...selectedMenuItem,
            description: selectedMenuItem.description || undefined
          }}
          isOpen={showMenuForm}
          onClose={closeMenuForm}
          onSubmit={handleMenuFormSubmit}
        />
      )}

      {showCustomForm && (
        <CustomMealForm
          isOpen={showCustomForm}
          onClose={closeCustomForm}
          onSubmit={handleCustomFormSubmit}
        />
      )}
    </div>
  );
}
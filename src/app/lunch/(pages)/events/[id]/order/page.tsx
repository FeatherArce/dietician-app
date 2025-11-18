"use client";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { Notification } from "@/components/Notification";
import PageAuthBlocker from "@/components/page/PageAuthBlocker";
import PageTitle from "@/components/page/PageTitle";
import Tabs from "@/components/Tabs";
import { toast } from "@/components/Toast";
import { AUTH_CONSTANTS } from "@/constants/app-constants";
import { authFetch } from "@/libs/auth-fetch";
import { formatCurrency, formatNumber } from "@/libs/formatter";
import { MenuCategory } from "@/prisma-generated/postgres-client";
import { getLunchEventById } from "@/services/client/lunch/lunch-event";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaClock,
  FaEdit,
  FaPlus,
  FaShoppingCart,
  FaStore,
  FaUsers,
  FaUtensils
} from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MealFormMode, MenuFormValues } from "./_components/MealForm";
import MealModal, { MealModalSettings } from "./_components/MealModal";
import { ILunchOrderItem, ILunchEvent, IShopMenu, IShopMenuCategory, IShopMenuItem } from "@/types/LunchEvent";


interface ExistingOrder {
  id: string;
  total: number;
  note?: string;
  items: ILunchOrderItem[];
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const [event, setEvent] = useState<ILunchEvent | undefined>();
  const [existingOrder, setExistingOrder] = useState<ExistingOrder | null>(null);
  const [orderItems, setOrderItems] = useState<ILunchOrderItem[]>([]);
  const [orderNote, setOrderNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventId, setEventId] = useState<string>("");
  const [mealModalSettings, setMealModalSettings] = useState<MealModalSettings>({
    mode: MealFormMode.ADD,
    from: 'custom',
    open: false
  });

  // 解析動態參數
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const getEvent = useCallback(async () => {
    if (!eventId) return;

    try {
      const { response, result } = await getLunchEventById(eventId);
      console.log('getLunchEventById > API Response:', { response, result });
      const event = result.data?.event;
      if (!response.ok || !result.success || !event) {
        throw new Error(result.message || '活動不存在');
      }
      setEvent(event);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    }
  }, [eventId]);

  useEffect(() => {
    getEvent();
  }, [getEvent]);

  // 獲取現有訂單
  useEffect(() => {
    const fetchExistingOrder = async () => {
      if (!user?.id || !eventId) return;

      try {
        const response = await authFetch(`/api/lunch/orders/user/${user.id}/event/${eventId}`);
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
  const openAddMenuMealModal = (menuItem: IShopMenuItem) => {
    setMealModalSettings({
      mode: MealFormMode.ADD,
      from: 'menu',
      menu_item: menuItem,
      open: true
    });
  };

  // 開啟客製化項目設定視窗
  const openAddCustomMealModal = () => {
    setMealModalSettings({
      mode: MealFormMode.ADD,
      from: 'custom',
      open: true
    });
  };

  const openEditMealModal = (item: ILunchOrderItem, index: number) => {
    if (!item) return;

    let foundedMenuItem = null;
    if (item.menu_item_id) {
      tabMenus?.forEach((menu) => {
        menu?.categories.forEach((category) => {
          const foundItem = category.items.find((i) => i.id === item.menu_item_id);
          if (foundItem) {
            foundedMenuItem = foundItem;
          }
        });
      });
    }

    setMealModalSettings({
      mode: MealFormMode.EDIT,
      index,
      values: item,
      from: foundedMenuItem ? 'menu' : 'custom',
      menu_item: foundedMenuItem || undefined,
      open: true
    });
  };

  // 新增或更新訂單項目，為了避免有重複項目，需要先檢查新增項目是否已存在
  // 如果備註有差異，則合併備註，否則只更新數量
  const appendOrderItem = useCallback((newItem: ILunchOrderItem) => {
    console.log("Appending order item", newItem);
    setOrderItems((prevItems) => {
      const existingItemIndex = prevItems?.findIndex(item =>
        item.name === newItem.name &&
        item.price === newItem.price
      );

      if (existingItemIndex !== -1) {
        // 如果已存在，則合併備註
        const existingItem = prevItems[existingItemIndex];
        const tempItem = Object.assign({}, existingItem);
        tempItem.quantity += newItem.quantity;
        console.log("Merging order item", {
          existingItem,
          newItem,
          tempItem,
          hasNote: !!newItem.note,
          noteCompare: newItem.note !== tempItem.note
        });
        if (!!newItem.note && newItem.note !== tempItem.note) {
          tempItem.note = tempItem.note + ' / ' + newItem.note;
        }

        const remainingItems = prevItems.filter((_, index) => index !== existingItemIndex);
        return [...remainingItems, tempItem];
      }

      // 如果不存在，則新增項目
      return [...prevItems, newItem];
    });
  }, []);

  const updateOrderItem = useCallback((index: number, updatedItem: ILunchOrderItem) => {
    console.log("Updating order item", index, updatedItem);
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = updatedItem;
      return updatedItems;
    });
  }, []);

  const handleMenuModalOk = useCallback((values: MenuFormValues, settings: MealModalSettings) => {
    setMealModalSettings({
      mode: MealFormMode.ADD,
      from: 'custom',
      open: false
    });
    const appendedItem: ILunchOrderItem = values as ILunchOrderItem;

    if (settings.mode === MealFormMode.ADD) {
      appendOrderItem(appendedItem);
    } else if (settings.mode === MealFormMode.EDIT && typeof settings.index === 'number') {
      updateOrderItem(settings.index, appendedItem);
    }
  }, [appendOrderItem, updateOrderItem]);

  const handleMenuModalClose = useCallback(() => {
    setMealModalSettings({
      mode: MealFormMode.ADD,
      from: 'custom',
      open: false
    });
  }, []);

  // 更新項目數量
  const updateItemQuantity = (index: number, change: number) => {
    setOrderItems(orderItems.map((item, i) => {
      if (i === index) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as ILunchOrderItem[]);
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

      const response = await authFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(existingOrder ? "訂單已更新！" : "訂單已提交！");
        // 使用瀏覽器返回上一頁，而不是強制跳轉到特定頁面
        router.back();
      } else {
        throw new Error(data.error || "提交失敗");
      }
    } catch (error) {
      console.error("Failed to submit order:", error);
      Notification.error({
        message: "提交訂單失敗：" + (error as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const tabMenus = useMemo(() => {
    const newMenus: Array<IShopMenu> = [];
    (event?.shop?.menus || []).forEach((menu) => {
      const newMenu: IShopMenu = { ...menu, categories: [], items: [] };
      const categoryMap = new Map<string, MenuCategory & { items: Array<IShopMenuItem>; }>();

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
      (menu?.items || []).forEach((item) => {
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

      (menu?.categories || []).forEach((category) => {
        categoryMap.set(category.id, category);
      });

      newMenu.categories = Array.from(categoryMap.values());
      newMenus.push(newMenu);
    });

    console.log("Generating tabs", { menus: event?.shop?.menus, newMenus });
    return newMenus;
  }, [event]);

  const TabMenuContent = ({ category }: { category: IShopMenuCategory }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {category.items.map(item => (
          <div
            key={item.id}
            className={`card border cursor-pointer transition-all hover:shadow-md ${!item.is_available ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
              }`}
            onClick={() => item.is_available && openAddMenuMealModal(item)}
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

  if (authLoading || loading) {
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
        description="您需要登入才能參與訂餐"
        loading={authLoading}
      />
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
          { label: '午餐系統', href: AUTH_CONSTANTS.DEFAULT_REDIRECT_AFTER_LOGIN },
          { label: event.title, href: `/lunch/events/${eventId}` },
          { label: '參與訂餐', current: true }
        ]}
      />

      {/* 頁面標題 */}
      <PageTitle
        title={
          <div className="flex items-center gap-3">
            <FaShoppingCart className="w-8 h-8 text-primary" />
            <span>{event.title} {existingOrder ? "修改訂單" : "新增訂單"}</span>
          </div>
        }
        description="請在下方選擇您想訂購的餐點，然後送出訂單"
      />

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
              <span>主辦：{event.owner?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 菜單 */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2">
        {/* 菜單 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h3 className="card-title">菜單</h3>
              {event.allow_custom_items && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={openAddCustomMealModal}
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

        {/* 訂單摘要 */}
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
                <div>
                  <DataTable<ILunchOrderItem>
                    dataSource={orderItems}
                    pagination={false}
                    columns={[
                      {
                        title: '',
                        key: 'actions',
                        width: 100,
                        render: (_, record, index) => (<>
                          <div className="flex items-center space-x-2">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => {
                                openEditMealModal(record, index);
                              }}
                            >
                              <FaEdit className="w-3 h-3" />
                            </button>
                            <button
                              className="btn btn-error btn-xs"
                              onClick={() => removeItem(index)}
                            >
                              <RiDeleteBin6Line className="w-4 h-4" />
                            </button>
                          </div>
                        </>)
                      },
                      { title: '餐點', key: 'name' },
                      { title: '備註', key: 'note', },
                      {
                        title: '單價',
                        key: 'price',
                        align: 'right',
                        width: 100,
                        render: (_, record) => formatCurrency(record.price)
                      },
                      {
                        title: '數量',
                        key: 'quantity',
                        align: 'right',
                        width: 100,
                        render: (_, record, index) => formatNumber(record.quantity)
                      },
                      {
                        title: '小計',
                        key: 'subtotal',
                        align: 'right',
                        width: 100,
                        render: (_, record) => {
                          return formatCurrency(record.price * record.quantity);
                        }
                      },
                    ]}
                  // summary={{
                  //   show: true,
                  //   columns: [
                  //     { key: 'subtotal-title', render: () => <span className="font-bold">總計</span> },
                  //     {
                  //       key: 'subtotal',
                  //       render: (data, allData) => {
                  //         const subtotal = allData.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                  //         return (
                  //           <div className="flex justify-end">
                  //             <span className="font-bold">總計: {formatCurrency(subtotal)}</span>
                  //           </div>
                  //         )
                  //       }
                  //     },
                  //   ]
                  // }}
                  />
                </div>
              </div>

              {/* 總計 */}
              {/* <div className="divider"></div> */}
              <div className="flex justify-end items-center text-lg font-bold">
                <span>總計：</span>
                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
              </div>

              {/* 提交按鈕 */}
              <button
                className="btn btn-primary w-full"
                onClick={submitOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <FaCheck className="w-4 h-4" />
                    送出訂單
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MealModal
        settings={mealModalSettings}
        open={mealModalSettings.open}
        onOk={handleMenuModalOk}
        onClose={handleMenuModalClose}
      />
    </div>
  );
}
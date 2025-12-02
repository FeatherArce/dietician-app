"use client";
import Breadcrumb, { lunchBreadcrumbHomeItem } from "@/components/Breadcrumb";
import DataTable, { Column } from "@/components/DataTable";
import { Notification, useNotificationAPI } from "@/components/Notification";
import SearchContainer from "@/components/SearchContainer";
import { SearchInput, Select } from "@/components/SearchContainer/SearchFields";
import { toast, useToastAPI } from "@/components/Toast";
import PageContainer from "@/components/page/PageContainer";
import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import { LunchEvent, UserRole } from "@/prisma-generated/postgres-client";
import moment from "moment-timezone";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaEdit,
  FaEye,
  FaPlus,
  FaToggleOff,
  FaToggleOn
} from "react-icons/fa";

interface EventWithStats extends LunchEvent {
  orderCount?: number;
  totalAmount?: number;
  participantCount?: number;
  shop?: {
    id: string;
    name: string;
  };
  owner?: {
    id: string;
    name: string;
  };
  [key: string]: unknown; // 添加索引簽章以符合 Record<string, unknown>
}

export default function EventsPage() {
  // 初始化 notification 和 toast API
  useNotificationAPI();
  useToastAPI();
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 統一的篩選邏輯
  const filteredEvents: EventWithStats[] = useMemo(() => {
    return (events || []).filter(event => {
      // 狀態篩選
      if (statusFilter) {
        const now = new Date();
        const orderDeadline = new Date(event.order_deadline);

        switch (statusFilter) {
          case "ACTIVE":
            if (!event.is_active) return false;
            break;
          case "INACTIVE":
            if (event.is_active) return false;
            break;
          case "UPCOMING":
            if (orderDeadline <= now) return false;
            break;
          case "PAST":
            if (orderDeadline > now) return false;
            break;
        }
      }

      // 日期篩選
      if (dateFilter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const orderDeadline = new Date(event.order_deadline);

        switch (dateFilter) {
          case "TODAY":
            if (orderDeadline < today || orderDeadline >= new Date(today.getTime() + 24 * 60 * 60 * 1000)) return false;
            break;
          case "WEEK":
            if (orderDeadline < today || orderDeadline > weekFromNow) return false;
            break;
          case "MONTH":
            if (orderDeadline < today || orderDeadline > monthFromNow) return false;
            break;
        }
      }

      // 文字搜尋篩選
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchTitle = event.title?.toLowerCase().includes(searchLower);
        const matchDescription = event.description?.toLowerCase().includes(searchLower);
        const matchLocation = event.location?.toLowerCase().includes(searchLower);
        const matchShop = event.shop?.name?.toLowerCase().includes(searchLower);
        const matchOwner = event.owner?.name?.toLowerCase().includes(searchLower);

        if (!matchTitle && !matchDescription && !matchLocation && !matchShop && !matchOwner) {
          return false;
        }
      }

      return true;
    });
  }, [events, statusFilter, dateFilter, searchTerm]);

  // 重置所有篩選條件
  const handleReset = useCallback(() => {
    setStatusFilter('');
    setDateFilter('');
    setSearchTerm('');
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const newParameters = new URLSearchParams();
      newParameters.append("include", "stats");
      if (user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR) {
        // 管理員和版主可以查看所有活動
      } else {
        if (user?.id) { newParameters.append("owner_id", user.id); }
      }

      const response = await fetch(`/api/lunch/events?${newParameters.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 載入活動資料
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const toggleEventStatus = useCallback(async (eventId: string, isActive: boolean) => {
    const action = isActive ? "關閉" : "開啟";

    // 使用 notification 來顯示確認對話框
    Notification.warning({
      title: '確認操作',
      message: `確定要${action}此活動嗎？`,
      actions: [
        {
          label: '確認',
          onClick: async () => {
            try {
              const response = await fetch(`/api/lunch/events/${eventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !isActive }),
              });

              if (response.ok) {
                await fetchEvents(); // 重新載入資料
                // 使用 toast 顯示成功訊息
                toast.success(`活動已成功${action}！`);
              } else {
                throw new Error('API 請求失敗');
              }
            } catch (error) {
              console.error("Failed to update event status:", error);
              // 使用 toast 顯示錯誤訊息
              toast.error(`無法${action}活動，請稍後再試。`);
            }
          },
          className: 'btn-warning'
        },
        {
          label: '取消',
          onClick: () => {
            // 取消操作，notification 會自動關閉
          },
          className: 'btn-ghost'
        }
      ]
    });
  }, [fetchEvents]);

  const getStatusBadge = (event: EventWithStats) => {
    const now = new Date();
    const orderDeadline = new Date(event.order_deadline);

    if (!event.is_active) {
      return <span className="badge badge-error badge-sm">已關閉</span>;
    }

    if (orderDeadline < now) {
      return <span className="badge badge-warning badge-sm">訂餐結束</span>;
    }

    return <span className="badge badge-success badge-sm">進行中</span>;
  };

  // DataTable 欄位定義
  const columns: Column<EventWithStats>[] = [
    {
      key: 'title',
      title: '活動名稱',
      dataIndex: 'title',
      sortable: true,
      render: (value) => (
        <div className="font-bold">{value as string}</div>
      )
    },
    {
      key: 'description',
      title: '描述',
      dataIndex: 'description',
      render: (value) => (
        <div className="max-w-xs truncate" title={value as string}>
          {value as string}
        </div>
      )
    },
    {
      key: 'location',
      title: '地點',
      dataIndex: 'location'
    },
    {
      key: 'status',
      title: '狀態',
      align: 'center',
      render: (_, record) => getStatusBadge(record)
    },
    {
      key: 'event_date',
      title: '活動日期',
      dataIndex: 'event_date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value as string).toLocaleDateString("zh-TW")}
        </div>
      )
    },
    {
      key: 'order_deadline',
      title: '訂餐截止',
      dataIndex: 'order_deadline',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {moment(value as string).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss")}
          <div className="text-xs text-base-content/70">
            {moment(value as string).tz("Asia/Taipei").format("HH:mm:ss")}
          </div>
        </div>
      )
    },
    {
      key: 'shop',
      title: '商店',
      render: (_, record) => (
        record.shop ? (
          <Link
            href={ROUTE_CONSTANTS.LUNCH_SHOP_DETAIL(record.shop.id)}
            className="link link-primary text-sm"
          >
            {record.shop.name}
          </Link>
        ) : (
          <span className="text-sm text-base-content/70">未指定</span>
        )
      )
    },
    {
      key: 'owner',
      title: '主辦人',
      render: (_, record) => (
        record.owner ? (
          <Link
            href={`/users/${record.owner.id}`}
            className="link text-sm"
          >
            {record.owner.name}
          </Link>
        ) : (
          <span className="text-sm text-base-content/70">未知</span>
        )
      )
    },
    {
      key: 'orderCount',
      title: '訂單數',
      dataIndex: '_count.orders',
      align: 'center',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-primary">{(value as number) || 0}</span>
      )
    },
    {
      key: 'attendeeCount',
      title: '參與人數',
      dataIndex: '_count.attendees',
      align: 'center',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-secondary">{(value as number) || 0}</span>
      )
    },
    {
      key: 'totalAmount',
      title: '總金額',
      dataIndex: '_count.totalAmount',
      align: 'center',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-accent">${(value as number) || 0}</span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center space-x-1">
          <Link
            href={ROUTE_CONSTANTS.LUNCH_EVENT_DETAIL(record.id)}
            className="btn btn-ghost btn-xs"
            title="檢視詳細"
          >
            <FaEye className="w-3 h-3" />
          </Link>
          <Link
            href={ROUTE_CONSTANTS.LUNCH_EVENT_EDIT(record.id)}
            className="btn btn-ghost btn-xs"
            title="編輯"
          >
            <FaEdit className="w-3 h-3" />
          </Link>
          <button
            className="btn btn-ghost btn-xs"
            title={record.is_active ? "關閉活動" : "開啟活動"}
            onClick={() => toggleEventStatus(record.id, record.is_active)}
          >
            {record.is_active ? (
              <FaToggleOn className="w-3 h-3 text-success" />
            ) : (
              <FaToggleOff className="w-3 h-3 text-error" />
            )}
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          lunchBreadcrumbHomeItem,
          { label: '活動管理', current: true }
        ]}
      />

      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">活動管理</h1>
          <p className="text-base-content/70 mt-1">
            管理訂餐活動，查看統計和參與狀況
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={ROUTE_CONSTANTS.LUNCH_EVENT_NEW} className="btn btn-primary">
            <FaPlus className="w-4 h-4" />
            建立活動
          </Link>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <SearchContainer
        title="搜尋和篩選"
        columns={3}
        onReset={handleReset}
      >
        <SearchInput
          label="搜尋活動"
          placeholder="搜尋活動名稱、描述、地點、商店或主辦人..."
          value={searchTerm}
          onChange={setSearchTerm}
          allowClear={true}
        />

        <Select
          label="狀態篩選"
          options={[
            { label: '進行中', value: 'ACTIVE' },
            { label: '已關閉', value: 'INACTIVE' },
            { label: '即將開始', value: 'UPCOMING' },
            { label: '已結束', value: 'PAST' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear={true}
        />

        <Select
          label="日期篩選"
          options={[
            { label: '今日', value: 'TODAY' },
            { label: '本週', value: 'WEEK' },
            { label: '本月', value: 'MONTH' },
          ]}
          value={dateFilter}
          onChange={setDateFilter}
          allowClear={true}
        />
      </SearchContainer>

      {/* 活動列表 */}
      <DataTable<EventWithStats>
        columns={columns}
        dataSource={filteredEvents}
        loading={loading}
        pagination={{
          current: 1,
          pageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showQuickJumper: true,
          showTotal: true
        }}
        summary={{
          show: true,
          fixed: true,
          columns: [
            {
              key: 'title',
              render: () => <span className="font-bold">總計</span>
            },
            {
              key: 'orderCount',
              type: 'sum',
              render: (data) => {
                const total = data.reduce((sum, item) => sum + (item.orderCount || 0), 0);
                return <span className="font-bold text-primary">{total}</span>;
              }
            },
            {
              key: 'participantCount',
              type: 'sum',
              render: (data) => {
                const total = data.reduce((sum, item) => sum + (item.participantCount || 0), 0);
                return <span className="font-bold text-secondary">{total}</span>;
              }
            },
            {
              key: 'totalAmount',
              type: 'sum',
              render: (data) => {
                const total = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
                return <span className="font-bold text-accent">${total}</span>;
              }
            }
          ]
        }}
        size="sm"
        hover={true}
        striped={true}
        bordered={true}
        emptyText="沒有找到活動"
      />

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <FaCalendarAlt className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">沒有找到活動</h3>
        </div>
      )}
    </PageContainer>
  );
}
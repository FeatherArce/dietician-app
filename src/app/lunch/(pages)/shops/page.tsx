"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { FaSearch, FaPlus, FaEdit, FaEye, FaStore, FaToggleOn, FaToggleOff, FaThLarge, FaTable, FaUtensils } from "react-icons/fa";
import { Shop } from "@/prisma-generated/postgres-client";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable, { Column } from "@/components/DataTable";
import SearchContainer from "@/components/SearchContainer";
import { SearchInput, Select } from "@/components/SearchContainer/SearchFields";
import PageContainer from "@/components/page/PageContainer";

interface ShopWithStats extends Shop {
  menuCount?: number;
  eventCount?: number;
  totalOrders?: number;
  avgRating?: number;
  [key: string]: unknown; // 添加索引簽章以符合 DataTable 要求
}

enum activeStatus { 
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredShops: ShopWithStats[] = useMemo(() => {
    return (shops || []).filter(shop => {
      // 狀態篩選
      if (statusFilter === activeStatus.ACTIVE && !shop.is_active) return false;
      if (statusFilter === activeStatus.INACTIVE && shop.is_active) return false;
      
      // 文字搜尋篩選
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchName = shop.name?.toLowerCase().includes(searchLower);
        const matchAddress = shop.address?.toLowerCase().includes(searchLower);
        const matchPhone = shop.phone?.toLowerCase().includes(searchLower);
        const matchDescription = shop.description?.toLowerCase().includes(searchLower);
        
        if (!matchName && !matchAddress && !matchPhone && !matchDescription) {
          return false;
        }
      }
      
      return true;
    });
  }, [shops, statusFilter, searchTerm]);

  // 重置所有篩選條件
  const handleReset = useCallback(() => {
    setStatusFilter('');
    setSearchTerm('');
  }, []);

  const fetchShops = useCallback(async () => {
    try {
      const response = await fetch("/api/lunch/shops");
      if (response.ok) {
        const data = await response.json();
        setShops(data.shops || []);
      }
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 載入商店資料
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const toggleShopStatus = useCallback(async (shopId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/lunch/shops/${shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        await fetchShops(); // 重新載入資料
      }
    } catch (error) {
      console.error("Failed to update shop status:", error);
    }
  }, [fetchShops]);

  // DataTable 欄位定義
  const columns: Column<ShopWithStats>[] = [
    {
      key: 'name',
      dataIndex: 'name',
      title: '商店名稱',
      render: (value, record) => (
        <div className="flex items-center space-x-2">
          <FaStore className="w-4 h-4 text-primary" />
          <div className="font-bold">{(value as string) || '-'}</div>
        </div>
      )
    },
    {
      key: 'description',
      title: '描述',
      dataIndex: 'description',
    },
    {
      key: 'status',
      title: '狀態',
      dataIndex: 'is_active',
      align: 'center',
      sortable: true,
      render: (_, record) => (
        <span
          className={`badge ${record.is_active ? "badge-success" : "badge-error"} badge-sm`}
        >
          {record.is_active ? "營業中" : "暫停營業"}
        </span>
      )
    },
    {
      key: 'address',
      title: '地址',
      dataIndex: 'address',
      sortable: true,
      render: (value) => (
        <div className="max-w-xs truncate" title={value as string || ''}>
          {(value as string) || '-'}
        </div>
      )
    },
    {
      key: 'phone',
      title: '電話',
      dataIndex: 'phone',
      sortable: true,
      render: (value) => (value as string) || '-'
    },
    {
      key: 'menuCount',
      title: '菜單項目',
      dataIndex: 'menuCount',
      align: 'center',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-primary">{(value as number) || 0}</span>
      )
    },
    {
      key: 'eventCount',
      title: '參與活動',
      dataIndex: 'eventCount',
      align: 'center',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-secondary">{(value as number) || 0}</span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center space-x-1">
          <Link
            href={`/lunch/shops/${record.id}`}
            className="btn btn-ghost btn-xs"
            title="檢視詳細"
          >
            <FaEye className="w-3 h-3" />
          </Link>
          <Link
            href={`/lunch/shops/${record.id}/edit`}
            className="btn btn-ghost btn-xs"
            title="編輯資料"
          >
            <FaEdit className="w-3 h-3" />
          </Link>
          {/* 編輯菜單 */}
          <Link
            href={`/lunch/shops/${record.id}/menus`}
            className="btn btn-ghost btn-xs"
            title="編輯菜單"
          >
            <FaUtensils className="w-3 h-3" />
          </Link>
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
          { label: '商店管理', current: true }
        ]}
      />

      {/* 頁面標題 */}
      <div className="flex flex-col justify-between md:flex-row md:items-center gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold">商店管理</h1>
          <p className="text-base-content/70 mt-1">
            管理餐廳商店，查看菜單和訂單統計
          </p>
        </div>
        <div className="self-end flex items-center space-x-3">
          <Link href="/lunch/shops/new" className="btn btn-primary">
            <FaPlus className="w-4 h-4" />
            新增商店
          </Link>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <SearchContainer
        title="搜尋和篩選"
        columns={2}
        onReset={handleReset}
      >
        <SearchInput
          label="搜尋商店"
          placeholder="搜尋商店名稱、地址、電話或描述..."
          value={searchTerm}
          onChange={setSearchTerm}
          allowClear={true}
        />
        
        <Select
          label="狀態篩選"
          options={[
            { label: '營業中', value: activeStatus.ACTIVE },
            { label: '暫停營業', value: activeStatus.INACTIVE },
          ]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          allowClear={true}
        />
      </SearchContainer>

      {/* 商店列表 */}
      <DataTable<ShopWithStats>
        columns={columns}
        dataSource={filteredShops}
        loading={loading}
        pagination={{
          current: 1,
          pageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showQuickJumper: true,
          showTotal: true
        }}
        size="sm"
        hover={true}
        striped={true}
        bordered={true}
        emptyText="沒有找到符合條件的商店"
      />

      {filteredShops.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaStore className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">沒有找到商店</h3>          
        </div>
      )}
    </PageContainer>
  );
}
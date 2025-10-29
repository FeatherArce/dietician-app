"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { FaPlus, FaEdit, FaEye, FaUserCheck, FaUserSlash } from "react-icons/fa";
import { User, UserRole } from "@/prisma-generated/postgres-client";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable, { Column } from "@/components/DataTable";
import PageContainer from "@/components/page/PageContainer";
import SearchContainer from "@/components/SearchContainer";
import { SearchInput, Select } from "@/components/SearchContainer/SearchFields";
import { getUserRoleLabel } from "@/types/User";

interface UserWithStats extends User {
  orderCount?: number;
  lastOrderDate?: Date;
  [key: string]: unknown; // 添加索引簽章以符合 DataTable 要求
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 統一的篩選邏輯
  const filteredUsers: UserWithStats[] = useMemo(() => {
    return users.filter(user => {
      // 角色篩選
      if (roleFilter && user.role !== roleFilter) {
        return false;
      }

      // 狀態篩選
      if (statusFilter) {
        const isActive = statusFilter === "ACTIVE";
        if (user.is_active !== isActive) {
          return false;
        }
      }

      // 文字搜尋篩選
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchName = user.name?.toLowerCase().includes(searchLower);
        const matchEmail = user.email?.toLowerCase().includes(searchLower);
        
        if (!matchName && !matchEmail) {
          return false;
        }
      }
      
      return true;
    });
  }, [users, roleFilter, statusFilter, searchTerm]);

  // 重置所有篩選條件
  const handleReset = useCallback(() => {
    setRoleFilter('');
    setStatusFilter('');
    setSearchTerm('');
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/lunch/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 載入使用者資料
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/lunch/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        await fetchUsers(); // 重新載入資料
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  }, [fetchUsers]);

  const getRoleBadge = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      ADMIN: "badge-error",
      USER: "badge-info",
      MODERATOR: "badge-warning",
    };

    const labels: Record<UserRole, string> = {
      ADMIN: getUserRoleLabel(UserRole.ADMIN),
      MODERATOR: getUserRoleLabel(UserRole.MODERATOR),
      USER: getUserRoleLabel(UserRole.USER),
    };

    return (
      <span className={`badge ${styles[role]} badge-sm`}>
        {labels[role]}
      </span>
    );
  };

  // DataTable 欄位定義
  const columns: Column<UserWithStats>[] = [
    {
      key: 'user',
      title: '使用者',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="avatar avatar-placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
              <span className="text-xl">
                {record.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <div className="font-semibold">{record.name}</div>
            <div className="text-sm text-base-content/70">
              {record.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: '角色',
      dataIndex: 'role',
      sortable: true,
      render: (_, record) => getRoleBadge(record.role)
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
          {record.is_active ? "啟用" : "停用"}
        </span>
      )
    },
    {
      key: 'created_at',
      title: '加入時間',
      dataIndex: 'created_at',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value as string).toLocaleDateString("zh-TW")}
        </div>
      )
    },
    {
      key: 'last_login',
      title: '最後登入',
      dataIndex: 'last_login',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {value
            ? new Date(value as string).toLocaleDateString("zh-TW")
            : "從未登入"}
        </div>
      )
    },
    {
      key: 'orderCount',
      title: '訂單數量',
      dataIndex: 'orderCount',
      align: 'center',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {(value as number) || 0} 筆
        </div>
      )
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center space-x-1">
          <Link
            href={`/lunch/users/${record.id}`}
            className="btn btn-ghost btn-xs"
            title="檢視詳細"
          >
            <FaEye className="w-3 h-3" />
          </Link>
          <Link
            href={`/lunch/users/${record.id}/edit`}
            className="btn btn-ghost btn-xs"
            title="編輯"
          >
            <FaEdit className="w-3 h-3" />
          </Link>
          <button
            className="btn btn-ghost btn-xs"
            title={record.is_active ? "停用使用者" : "啟用使用者"}
            onClick={() => toggleUserStatus(record.id, record.is_active)}
          >
            {record.is_active ? (
              <FaUserSlash className="w-3 h-3 text-error" />
            ) : (
              <FaUserCheck className="w-3 h-3 text-success" />
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
          { label: '使用者管理', current: true }
        ]}
      />

      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">使用者管理</h1>
          <p className="text-base-content/70 mt-1">
            管理系統使用者，查看訂餐記錄和統計資料
          </p>
        </div>
        <Link href="/lunch/users/new" className="btn btn-primary">
          <FaPlus className="w-4 h-4" />
          新增使用者
        </Link>
      </div>

      {/* 搜尋和篩選 */}
      <SearchContainer
        title="搜尋和篩選"
        columns={3}
        onReset={handleReset}
      >
        <SearchInput
          label="搜尋使用者"
          placeholder="搜尋使用者名稱或電子信箱..."
          value={searchTerm}
          onChange={setSearchTerm}
          allowClear={true}
        />
        
        <Select
          label="角色篩選"
          options={[
            { label: getUserRoleLabel(UserRole.ADMIN), value: UserRole.ADMIN },
            { label: getUserRoleLabel(UserRole.MODERATOR), value: UserRole.MODERATOR },
            { label: getUserRoleLabel(UserRole.USER), value: UserRole.USER },
          ]}
          value={roleFilter}
          onChange={setRoleFilter}
          allowClear={true}
        />

        <Select
          label="狀態篩選"
          options={[
            { label: '啟用中', value: 'ACTIVE' },
            { label: '已停用', value: 'INACTIVE' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear={true}
        />
      </SearchContainer>

      {/* 使用者列表 */}
      <DataTable<UserWithStats>
        columns={columns}
        dataSource={filteredUsers}
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
        emptyText="沒有找到符合條件的使用者"
      />
    </PageContainer>
  );
}
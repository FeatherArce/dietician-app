"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaUserCheck,
  FaUserSlash,
  FaTrash,
} from "react-icons/fa";
import { User, UserRole } from "@/prisma-generated/postgres-client";
import DataTable, { Column } from "@/components/DataTable";
import PageContainer from "@/components/page/PageContainer";
import SearchContainer from "@/components/SearchContainer";
import { SearchInput, Select } from "@/components/SearchContainer/SearchFields";
import { getUserRoleChineseName } from "@/types/User";
import Modal, { ModalRef } from "@/components/Modal";
import { deleteUser } from "@/services/client/admin/admin-user";
import { toast } from "@/components/Toast";
import { getUsers, logicalDeleteUser, restoreUser } from "@/services/client/user";
import { FcDataRecovery } from "react-icons/fc";
import UserAccountTable from "./_components/UserAccountTable";
import { formatNumber } from "@/libs/formatter";
import { useUsers } from "@/services/client/useUser";
import { UserWithSafetyFields } from "@/types/api/user";

// interface UserWithStats extends User {
//   orderCount?: number;
//   lastOrderDate?: Date;
//   [key: string]: unknown; // 添加索引簽章以符合 DataTable 要求
// }

export default function UsersPage() {
  const { users, isLoading, isError, mutate } = useUsers();
  const [loading, setLoading] = useState(false);
  const [deleteing, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const deleteUserModalRef = useRef<ModalRef>(null);
  const [deleteModalSettings, setDeleteModalSettings] = useState<{
    user: UserWithSafetyFields | null;
  }>({ user: null });
  const restoreUserModalRef = useRef<ModalRef>(null);
  const [restoreModalSettings, setRestoreModalSettings] = useState<{
    user: UserWithSafetyFields | null;
  }>({ user: null });
  const userAccountsModalRef = useRef<ModalRef>(null);
  const [userAccountModalSettings, setUserAccountModalSettings] = useState<{
    user: UserWithSafetyFields | null;
  }>({ user: null });

  // 統一的篩選邏輯
  const filteredUsers: UserWithSafetyFields[] = useMemo(() => {
    return users?.filter((user) => {
      // 已刪除篩選
      if (!showDeleted && user.is_deleted) {
        return false;
      }

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
  }, [users, roleFilter, statusFilter, searchTerm, showDeleted]);

  // 重置所有篩選條件
  const handleReset = useCallback(() => {
    setRoleFilter("");
    setStatusFilter("");
    setSearchTerm("");
  }, []);

  const toggleUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        await mutate(); // 重新載入資料
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
    } finally {
      setLoading(false);
    }
  }, [mutate]);

  const getRoleBadge = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      ADMIN: "badge-error",
      USER: "badge-info",
      MODERATOR: "badge-warning",
      GUEST: "badge-secondary",
    };

    const labels: Record<UserRole, string> = {
      ADMIN: getUserRoleChineseName(UserRole.ADMIN),
      MODERATOR: getUserRoleChineseName(UserRole.MODERATOR),
      USER: getUserRoleChineseName(UserRole.USER),
      GUEST: getUserRoleChineseName(UserRole.GUEST),
    };

    return (
      <span className={`badge ${styles[role]} badge-sm`}>{labels[role]}</span>
    );
  };

  const handleOpenDeleteUserConfirm = useCallback(async (user: UserWithSafetyFields) => {
    try {
      setDeleting(true);
      await logicalDeleteUser(user.id);
      toast.success(`使用者 ${user.name} 已成功刪除`);
      deleteUserModalRef.current?.close();
      // 重新載入使用者列表
      await mutate();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(`刪除使用者 ${user.name} 失敗`);
    } finally {
      setDeleting(false);
    }
  }, [mutate]);

  const handleRestoreUser = useCallback(async (user: UserWithSafetyFields) => {
    try {
      setRestoring(true);
      const { response, result } = await restoreUser(user.id);
      if (!response.ok || !result.success) {
        throw new Error(result.message || '復原使用者失敗');
      }
      toast.success(`使用者 ${user.name} 已成功復原`);
      restoreUserModalRef.current?.close();
      await mutate();
    } catch (error) {
      console.error("Failed to restore user:", error);
      toast.error(`復原使用者 ${user.name} 失敗`);
    } finally {
      setRestoring(false);
    }
  }, [mutate]);

  // DataTable 欄位定義
  const columns: Column<UserWithSafetyFields>[] = [
    {
      key: "user",
      title: "使用者",
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="avatar avatar-placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
              <span className="text-xl">
                {record.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <Link
            href={`/users/${record.id}`}
            className="link link-primary link-hover flex flex-col"
          >
            <div className="font-semibold">{record.name}</div>
            <div className="text-sm text-base-content/70">{record.email}</div>
          </Link>
        </div>
      ),
    },
    {
      key: "role",
      title: "角色",
      dataIndex: "role",
      sortable: true,
      render: (_, record) => getRoleBadge(record.role),
    },
    {
      key: "status",
      title: "狀態",
      dataIndex: "is_active",
      align: "center",
      sortable: true,
      render: (_, record) => (
        <span
          className={`badge ${record.is_active ? "badge-success" : "badge-error"
            } badge-sm`}
        >
          {record.is_active ? "啟用" : "停用"}
        </span>
      ),
    },
    {
      key: "created_at",
      title: "加入時間",
      dataIndex: "created_at",
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value as string).toLocaleDateString("zh-TW")}
        </div>
      ),
    },
    {
      key: "last_login",
      title: "最後登入",
      dataIndex: "last_login",
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {value
            ? new Date(value as string).toLocaleDateString("zh-TW")
            : "從未登入"}
        </div>
      ),
    },
    {
      key: "login_count",
      title: "登入次數",
      dataIndex: "login_count",
      render: (value) => (
        <div className="text-sm">{formatNumber(value as number || 0)} 次</div>
      ),
    },
    {
      key: "is_active",
      title: "是否啟用",
      width: 120,
      render: (value) => (
        <span className={`${value ? "text-success" : "text-error"}`}>
          {value ? "是" : "否"}
        </span>
      ),
    },
    {
      key: "is_deleted",
      title: "已刪除",
      width: 120,
      render: (value) => (
        <span className={`${value ? "text-error" : "text-base"}`}>
          {value ? "是" : "否"}
        </span>
      ),
    },
    {
      key: "thirdPartyAccounts",
      title: "第三方帳號",
      render: (_, record) => (
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => {
            setUserAccountModalSettings({ user: record });
            userAccountsModalRef.current?.open();
          }}
        >
          <FaEye className="w-3 h-3 mr-1" />
          檢視
        </button>
      ),
    },
    {
      key: "orderCount",
      title: "訂單數量",
      dataIndex: "orderCount",
      align: "center",
      sortable: true,
      render: (value) => (
        <div className="text-sm">{(value as number) || 0} 筆</div>
      ),
    },
    {
      key: "actions",
      title: "操作",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center space-x-1">
          <Link
            href={`/users/${record.id}/edit`}
            className="btn btn-ghost btn-xs"
            title="編輯"
          >
            <FaEdit className="w-3 h-3" />
          </Link>
          {/* 軟刪除 */}
          <button
            className="btn btn-ghost btn-xs"
            title={record.is_active ? "停用使用者" : "啟用使用者"}
            onClick={() => toggleUserStatus(record.id, record.is_active)}
            disabled={loading || isLoading}
          >
            {record.is_active ? (
              <FaUserSlash className="w-3 h-3 text-error" />
            ) : (
              <FaUserCheck className="w-3 h-3 text-success" />
            )}
          </button>
          {/* 真刪除 */}
          {record.is_deleted ? (
            <button
              className="btn btn-ghost btn-xs"
              title="還原使用者"
              onClick={async () => {
                setRestoreModalSettings({ user: record });
                restoreUserModalRef.current?.open();
              }}
              disabled={loading || restoring}
            >
              <FcDataRecovery className="w-3 h-3 text-success" />
            </button>
          ) : (
            <button
              className="btn btn-ghost btn-xs"
              title="刪除使用者"
              onClick={() => {
                // if (confirm(`確定要刪除使用者 ${record.name} 嗎？此操作不可復原。`)) { }
                setDeleteModalSettings({ user: record });
                deleteUserModalRef.current?.open();
              }}
              disabled={loading || deleteing}
            >
              <FaTrash className="w-3 h-3 text-error" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">使用者管理</h1>
          <p className="text-base-content/70 mt-1">
            管理系統使用者，查看訂餐記錄和統計資料
          </p>
        </div>
        <Link href="/users/new" className="btn btn-primary">
          <FaPlus className="w-4 h-4" />
          新增使用者
        </Link>
      </div>

      {/* 搜尋和篩選 */}
      <SearchContainer title="搜尋和篩選" columns={3} onReset={handleReset}>
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
            {
              label: getUserRoleChineseName(UserRole.ADMIN),
              value: UserRole.ADMIN,
            },
            {
              label: getUserRoleChineseName(UserRole.MODERATOR),
              value: UserRole.MODERATOR,
            },
            {
              label: getUserRoleChineseName(UserRole.USER),
              value: UserRole.USER,
            },
          ]}
          value={roleFilter}
          onChange={setRoleFilter}
          allowClear={true}
        />

        <Select
          label="狀態篩選"
          options={[
            { label: "啟用中", value: "ACTIVE" },
            { label: "已停用", value: "INACTIVE" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear={true}
        />
      </SearchContainer>

      <div className="flex flex-end">
        <fieldset className="fieldset w-64 p-4">
          <label className="label">
            <input
              type="checkbox"
              className="toggle"
              checked={showDeleted}
              onChange={() => setShowDeleted((prev) => !prev)}
            />
            顯示已刪除
          </label>
        </fieldset>
      </div>

      {/* 使用者列表 */}
      <DataTable<UserWithSafetyFields>
        columns={columns}
        dataSource={filteredUsers}
        loading={loading || isLoading}
        pagination={{
          current: 1,
          pageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showQuickJumper: true,
          showTotal: true,
        }}
        size="sm"
        hover={true}
        striped={true}
        bordered={true}
        emptyText="沒有找到符合條件的使用者"
      />

      <Modal
        ref={deleteUserModalRef}
        id="delete-user-confirm-modal"
        loading={deleteing}
        title="刪除使用者"
        okText="確定"
        onOk={() => {
          handleOpenDeleteUserConfirm(deleteModalSettings.user!);
        }}
        closeText="取消"
        onClose={() => {
          deleteUserModalRef.current?.close();
        }}
      >
        <div className="relative">
          <p>
            確定要刪除使用者 {deleteModalSettings.user?.name}(
            {deleteModalSettings.user?.email}) 嗎？此操作不可復原。
          </p>
          {(loading || isLoading) && (
            <div className="container mx-auto px-4 py-8 z-50 absolute">
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        ref={restoreUserModalRef}
        id="restore-user-confirm-modal"
        title="復原使用者"
        loading={restoring}
        okText="確定"
        onOk={async () => {
          if (restoreModalSettings.user) {
            await handleRestoreUser(restoreModalSettings.user);
          }
        }}
        closeText="取消"
        onClose={() => {
          restoreUserModalRef.current?.close();
        }}
      >
        <p>
          確定要復原使用者 {restoreModalSettings.user?.name} (
          {restoreModalSettings.user?.email}) 嗎？
        </p>
      </Modal>
      <Modal
        ref={userAccountsModalRef}
        id="user-accounts-modal"
        title="使用者第三方帳號綁定資訊"
        okText="關閉"
        onOk={() => {
          userAccountsModalRef.current?.close();
        }}
      >
        <UserAccountTable userId={userAccountModalSettings.user?.id || ""} />
      </Modal>
    </PageContainer>
  );
}

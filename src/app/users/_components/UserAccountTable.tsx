"use client";
import React, { useCallback, useEffect, useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import { getAccountsByUserId } from "@/services/client/account-services";
import { toast } from "@/components/Toast";
import { Account } from "@/prisma-generated/postgres-client";

interface UserAccountTableProps {
  userId: string;
}

export default function UserAccountTable({ userId }: UserAccountTableProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if(!userId) return;
    try {
      setLoading(true);
      const { response, result } = await getAccountsByUserId(userId);
      if (response.ok && result.success) {
        setAccounts(result.data?.accounts || []);
      } else {
        throw new Error(result.message || "查詢帳號失敗");
      }
    } catch (error) {
      toast.error((error as Error).message || "查詢帳號失敗");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const columns: Column<any>[] = [
    {
      key: "provider",
      title: "Provider",
      dataIndex: "provider",
      align: "left",
      sortable: true,
    },
    {
      key: "providerAccountId",
      title: "Provider Account ID",
      dataIndex: "providerAccountId",
      align: "left",
      sortable: true,
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
      align: "left",
      sortable: true,
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={accounts}
      loading={loading}
      emptyText="此使用者尚未綁定任何第三方帳號。"
      size="sm"
      bordered
      striped
      hover
      compact
    />
  );
}

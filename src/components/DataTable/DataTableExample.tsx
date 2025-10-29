import React from 'react';
import DataTable, { Column, PaginationConfig } from '@/components/DataTable';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

// 範例資料類型
interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'MODERATOR';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

// 範例資料
const sampleUsers: User[] = [
  {
    id: '1',
    name: '張小明',
    email: 'zhang@example.com',
    role: 'ADMIN',
    is_active: true,
    created_at: '2023-01-15T10:30:00Z',
    last_login: '2023-12-01T09:15:00Z'
  },
  {
    id: '2',
    name: '李美麗',
    email: 'li@example.com',
    role: 'USER',
    is_active: true,
    created_at: '2023-02-20T14:22:00Z',
    last_login: '2023-11-30T16:45:00Z'
  },
  {
    id: '3',
    name: '王大華',
    email: 'wang@example.com',
    role: 'MODERATOR',
    is_active: false,
    created_at: '2023-03-10T08:45:00Z'
  },
  // 更多範例資料...
  ...Array.from({ length: 47 }, (_, i) => ({
    id: `${i + 4}`,
    name: `用戶${i + 4}`,
    email: `user${i + 4}@example.com`,
    role: ['ADMIN', 'USER', 'MODERATOR'][i % 3] as 'ADMIN' | 'USER' | 'MODERATOR',
    is_active: Math.random() > 0.3,
    created_at: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    last_login: Math.random() > 0.2 ? new Date(2023, 11, Math.floor(Math.random() * 30) + 1).toISOString() : undefined
  }))
];

export default function DataTableExample() {
  // 定義表格欄位
  const columns: Column<User>[] = [
    {
      key: 'name',
      title: '姓名',
      dataIndex: 'name',
      sortable: true,
      filterable: true,
      width: 120,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content w-8 h-8 rounded-full">
              <span className="text-xs">{String(value).charAt(0)}</span>
            </div>
          </div>
          <span className="font-medium">{String(value)}</span>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      sortable: true,
      filterable: true,
      render: (value) => (
        <a href={`mailto:${value}`} className="link link-primary">
          {String(value)}
        </a>
      )
    },
    {
      key: 'role',
      title: '角色',
      dataIndex: 'role',
      align: 'center',
      sortable: true,
      filterable: true,
      width: 100,
      render: (value) => {
        const roleConfig = {
          ADMIN: { text: '系統管理員', class: 'badge-error' },
          MODERATOR: { text: '管理者', class: 'badge-warning' },
          USER: { text: '用戶', class: 'badge-info' }
        };
        const config = roleConfig[value as keyof typeof roleConfig];
        return (
          <span className={`badge ${config.class} badge-sm`}>
            {config.text}
          </span>
        );
      }
    },
    {
      key: 'is_active',
      title: '狀態',
      dataIndex: 'is_active',
      align: 'center',
      sortable: true,
      width: 80,
      render: (value) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-error'} badge-sm`}>
          {value ? '啟用' : '停用'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: '建立時間',
      dataIndex: 'created_at',
      align: 'center',
      sortable: true,
      width: 120,
      render: (value) => new Date(String(value)).toLocaleDateString('zh-TW')
    },
    {
      key: 'last_login',
      title: '最後登入',
      dataIndex: 'last_login',
      align: 'center',
      sortable: true,
      width: 120,
      render: (value) => value 
        ? new Date(String(value)).toLocaleDateString('zh-TW')
        : <span className="text-base-content/50">從未登入</span>
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <div className="flex justify-center space-x-1">
          <button 
            className="btn btn-ghost btn-xs"
            onClick={() => console.log('查看', record)}
          >
            <FaEye className="w-3 h-3" />
          </button>
          <button 
            className="btn btn-ghost btn-xs"
            onClick={() => console.log('編輯', record)}
          >
            <FaEdit className="w-3 h-3" />
          </button>
          <button 
            className="btn btn-ghost btn-xs text-error"
            onClick={() => console.log('刪除', record)}
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      )
    }
  ];

  // 分頁設定
  const paginationConfig: PaginationConfig = {
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: [5, 10, 20, 50],
    showQuickJumper: true,
    showTotal: true
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">DataTable 元件範例</h1>
        <p className="text-base-content/70">
          展示完整功能的表格元件，包含搜尋、篩選、排序、分頁等功能
        </p>
      </div>

      {/* 基本表格 */}
      <div className="card bg-base-100 shadow-sm mb-8">
        <div className="card-body">
          <h2 className="card-title mb-4">基本表格</h2>
          <DataTable
            columns={columns}
            dataSource={sampleUsers}
            pagination={paginationConfig}
            onRow={(record) => ({
              onClick: () => console.log('點擊行:', record),
              className: 'hover:bg-base-200'
            })}
          />
        </div>
      </div>

      {/* 不同樣式的表格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 緊湊表格 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title mb-4">緊湊樣式 (前5筆)</h3>
            <DataTable
              columns={columns.slice(0, 4)}
              dataSource={sampleUsers.slice(0, 5)}
              pagination={false}
              size="sm"
              compact={true}
            />
          </div>
        </div>

        {/* 無邊框表格 */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title mb-4">無邊框樣式 (前5筆)</h3>
            <DataTable
              columns={columns.slice(0, 4)}
              dataSource={sampleUsers.slice(0, 5)}
              pagination={false}
              bordered={false}
              striped={false}
            />
          </div>
        </div>
      </div>

      {/* 載入狀態範例 */}
      <div className="card bg-base-100 shadow-sm mt-6">
        <div className="card-body">
          <h3 className="card-title mb-4">載入狀態</h3>
          <DataTable
            columns={columns.slice(0, 4)}
            dataSource={[]}
            loading={true}
          />
        </div>
      </div>
    </div>
  );
}
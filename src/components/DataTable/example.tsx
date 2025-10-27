// DataTable 總結欄使用範例

import DataTable, { Column, SummaryConfig } from '@/components/DataTable';

// 範例資料類型
interface OrderData extends Record<string, unknown> {
  id: string;
  customerName: string;
  amount: number;
  quantity: number;
  status: string;
  orderDate: string;
}

// 範例資料
const sampleData: OrderData[] = [
  { id: '001', customerName: '張三', amount: 1200, quantity: 3, status: '已完成', orderDate: '2024-10-15' },
  { id: '002', customerName: '李四', amount: 800, quantity: 2, status: '進行中', orderDate: '2024-10-14' },
  { id: '003', customerName: '王五', amount: 1500, quantity: 5, status: '已完成', orderDate: '2024-10-13' },
  // ... 更多資料
];

export default function OrderTableExample() {
  // 定義表格欄位
  const columns: Column<OrderData>[] = [
    {
      key: 'id',
      title: '訂單編號',
      dataIndex: 'id',
      width: 100,
    },
    {
      key: 'customerName',
      title: '客戶姓名',
      dataIndex: 'customerName',
      width: 120,
    },
    {
      key: 'amount',
      title: '金額',
      dataIndex: 'amount',
      align: 'right',
      sortable: true,
      render: (value: unknown) => `$${value}`,
    },
    {
      key: 'quantity',
      title: '數量',
      dataIndex: 'quantity',
      align: 'center',
      sortable: true,
    },
    {
      key: 'status',
      title: '狀態',
      dataIndex: 'status',
      filterable: true,
      render: (value: unknown) => (
        <span className={`badge ${value === '已完成' ? 'badge-success' : 'badge-warning'}`}>
          {String(value)}
        </span>
      ),
    },
    {
      key: 'orderDate',
      title: '訂單日期',
      dataIndex: 'orderDate',
      sortable: true,
    },
  ];

  // 定義總結欄
  const summary: SummaryConfig<OrderData> = {
    show: true,
    fixed: true, // 固定總結，不受分頁影響
    columns: [
      {
        key: 'customerName',
        type: 'custom',
        render: () => <strong>總計</strong>,
      },
      {
        key: 'amount',
        type: 'sum',
        precision: 2,
        prefix: '$',
      },
      {
        key: 'quantity',
        type: 'sum',
        suffix: ' 件',
      },
      {
        key: 'status',
        type: 'custom',
        render: (data) => {
          const completedCount = data.filter(item => item.status === '已完成').length;
          const totalCount = data.length;
          return `${completedCount}/${totalCount} 已完成`;
        },
      },
      {
        key: 'orderDate',
        type: 'count',
        suffix: ' 筆',
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">訂單管理表格</h1>
      
      <DataTable<OrderData>
        columns={columns}
        dataSource={sampleData}
        summary={summary}
        pagination={{
          current: 1,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: true,
        }}
        bordered
        striped
        hover
      />
    </div>
  );
}

/*
總結欄功能說明：

1. **基本配置**
   - show: 是否顯示總結欄
   - fixed: 是否固定總結（不受分頁影響）

2. **總結類型**
   - sum: 數值總和
   - avg: 數值平均
   - count: 記錄數量
   - custom: 自定義計算

3. **格式化選項**
   - precision: 數值精度（小數點位數）
   - prefix: 前綴文字
   - suffix: 後綴文字

4. **自定義渲染**
   - render 函數可接收三個參數：
     - data: 當前頁面資料（受分頁影響）
     - allData: 全部資料（不受分頁影響）
     - column: 欄位定義

5. **樣式特色**
   - 總結欄使用 tfoot 元素
   - 背景色為 bg-base-200
   - 字體加粗 font-semibold
   - 繼承欄位的對齊方式和樣式

使用場景：
- 財務報表：顯示金額總計、平均值
- 庫存管理：顯示數量統計
- 銷售數據：顯示業績總覽
- 任何需要統計摘要的表格
*/
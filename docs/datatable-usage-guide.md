# DataTable 元件使用說明

## 概述

DataTable 是一個功能完整的表格元件，基於 DaisyUI 樣式設計，支援搜尋、排序、篩選、分頁等功能。

## 主要特性

- ✅ **完整泛型支援** - 支援自定義資料類型
- ✅ **搜尋功能** - 全域搜尋表格內容
- ✅ **排序功能** - 欄位點擊排序
- ✅ **分頁功能** - 支援頁面導航和跳轉
- ✅ **自定義渲染** - 支援自定義欄位渲染
- ✅ **DaisyUI 樣式** - 完全兼容 DaisyUI 主題
- ✅ **響應式設計** - 適配各種螢幕尺寸
- ✅ **載入狀態** - 內建載入動畫
- ✅ **空狀態** - 自定義無資料顯示
- ✅ **行交互** - 支援行點擊事件

## 基本使用

### 1. 導入元件

```tsx
import DataTable, { Column, PaginationConfig } from '@/components/DataTable';
```

### 2. 定義資料類型

```tsx
interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  is_active: boolean;
}
```

**重要**: 資料類型必須繼承 `Record<string, unknown>` 才能正確使用泛型。

### 3. 定義欄位配置

```tsx
const columns: Column<User>[] = [
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name',
    sortable: true,
    filterable: true,
    render: (value) => <strong>{String(value)}</strong>
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
    sortable: true,
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
    render: (value) => (
      <span className={`badge ${value === 'ADMIN' ? 'badge-error' : 'badge-info'}`}>
        {value === 'ADMIN' ? '管理員' : '用戶'}
      </span>
    )
  },
  {
    key: 'actions',
    title: '操作',
    align: 'center',
    render: (_, record) => (
      <div className="flex justify-center space-x-2">
        <button className="btn btn-ghost btn-xs">編輯</button>
        <button className="btn btn-ghost btn-xs text-error">刪除</button>
      </div>
    )
  }
];
```

### 4. 配置分頁

```tsx
const paginationConfig: PaginationConfig = {
  current: 1,
  pageSize: 10,
  total: users.length,
  showSizeChanger: true,
  pageSizeOptions: [5, 10, 20, 50],
  showQuickJumper: true,
  showTotal: true
};
```

### 5. 使用元件

```tsx
<DataTable
  columns={columns}
  dataSource={users}
  pagination={paginationConfig}
  searchable={true}
  searchPlaceholder="搜尋用戶..."
  onRow={(record) => ({
    onClick: () => console.log('點擊:', record),
    className: 'hover:bg-base-200'
  })}
/>
```

## API 參考

### DataTable Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `columns` | `Column<T>[]` | - | 欄位配置 |
| `dataSource` | `T[]` | - | 資料來源 |
| `loading` | `boolean` | `false` | 載入狀態 |
| `pagination` | `PaginationConfig \| false` | `false` | 分頁配置 |
| `className` | `string` | `''` | 自定義樣式類別 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 表格大小 |
| `bordered` | `boolean` | `true` | 是否顯示邊框 |
| `striped` | `boolean` | `true` | 是否條紋樣式 |
| `hover` | `boolean` | `true` | 是否 hover 效果 |
| `compact` | `boolean` | `false` | 是否緊湊模式 |
| `searchable` | `boolean` | `true` | 是否顯示搜尋 |
| `searchPlaceholder` | `string` | `'搜尋...'` | 搜尋佔位文字 |
| `emptyText` | `string` | `'暫無資料'` | 空狀態文字 |
| `onRow` | `(record: T, index: number) => RowProps` | - | 行事件配置 |

### Column Interface

| 屬性 | 類型 | 說明 |
|------|------|------|
| `key` | `string` | 唯一鍵值 |
| `title` | `string` | 欄位標題 |
| `dataIndex` | `keyof T` | 資料欄位名 |
| `align` | `'left' \| 'center' \| 'right'` | 對齊方式 |
| `width` | `string \| number` | 欄位寬度 |
| `sortable` | `boolean` | 是否可排序 |
| `filterable` | `boolean` | 是否可篩選 |
| `render` | `(value, record, index) => ReactNode` | 自定義渲染 |
| `className` | `string` | 自定義樣式 |

### PaginationConfig Interface

| 屬性 | 類型 | 說明 |
|------|------|------|
| `current` | `number` | 當前頁面 |
| `pageSize` | `number` | 每頁筆數 |
| `total` | `number` | 總筆數 |
| `showSizeChanger` | `boolean` | 是否顯示頁面大小選擇器 |
| `pageSizeOptions` | `number[]` | 頁面大小選項 |
| `showQuickJumper` | `boolean` | 是否顯示快速跳轉 |
| `showTotal` | `boolean` | 是否顯示總筆數 |

## 使用範例

### 基本表格

```tsx
<DataTable
  columns={columns}
  dataSource={data}
/>
```

### 帶分頁的表格

```tsx
<DataTable
  columns={columns}
  dataSource={data}
  pagination={{
    current: 1,
    pageSize: 10,
    total: data.length,
    showSizeChanger: true,
    showQuickJumper: true
  }}
/>
```

### 緊湊樣式表格

```tsx
<DataTable
  columns={columns}
  dataSource={data}
  size="sm"
  compact={true}
  bordered={false}
  striped={false}
/>
```

### 載入狀態

```tsx
<DataTable
  columns={columns}
  dataSource={[]}
  loading={true}
/>
```

### 自定義行交互

```tsx
<DataTable
  columns={columns}
  dataSource={data}
  onRow={(record, index) => ({
    onClick: () => handleRowClick(record),
    onDoubleClick: () => handleRowDoubleClick(record),
    className: record.is_active ? 'bg-success/10' : 'bg-error/10'
  })}
/>
```

## 樣式自定義

### 使用 DaisyUI 主題

元件完全兼容 DaisyUI 主題系統，會自動適配當前主題顏色。

### 自定義樣式

```tsx
<DataTable
  className="shadow-lg rounded-lg"
  columns={columns.map(col => ({
    ...col,
    className: 'font-semibold'
  }))}
  dataSource={data}
/>
```

## 最佳實踐

1. **資料類型定義**: 確保資料類型繼承 `Record<string, unknown>`
2. **效能優化**: 大資料集建議使用後端分頁
3. **響應式設計**: 為不同螢幕尺寸配置合適的欄位寬度
4. **無障礙支援**: 提供適當的 ARIA 標籤和鍵盤導航
5. **錯誤處理**: 提供適當的載入和錯誤狀態

## 故障排除

### TypeScript 錯誤

**問題**: 類型不匹配錯誤
**解決**: 確保資料類型繼承 `Record<string, unknown>`

```tsx
// ❌ 錯誤
interface User {
  id: string;
  name: string;
}

// ✅ 正確
interface User extends Record<string, unknown> {
  id: string;
  name: string;
}
```

### 渲染問題

**問題**: 自定義渲染不顯示
**解決**: 確保 render 函數返回有效的 ReactNode

```tsx
// ❌ 錯誤
render: (value) => value

// ✅ 正確
render: (value) => String(value || '')
```

## 更新日誌

### v1.0.0

- 初始版本發布
- 支援基本表格功能
- 整合 DaisyUI 樣式
- 完整 TypeScript 支援
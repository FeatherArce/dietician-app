# ComboInput 整合指南

## 概述

`ComboInput` 元件已成功建立並整合到專案中。以下是整合時需要注意的要點。

## 資料庫備註處理

### 1. 儲存格式

由於 Prisma schema 中 `note` 欄位定義為 `String?`，我們需要將陣列轉換為字串儲存：

```prisma
model LunchOrderItem {
  // ...
  note     String? // 備註
  // ...
}
```

### 2. 轉換處理

使用 `note-helper.ts` 中的輔助函數進行轉換：

```typescript
import { noteToString, formatNote, noteToArray } from '@/libs/note-helper';

// 儲存時：將陣列轉換為字串
const noteString = noteToString(['半飯', '不要辣']); // "半飯、不要辣"

// 顯示時：格式化備註
const displayNote = formatNote(['半飯', '不要辣']); // "半飯、不要辣"

// 編輯時：將字串轉換為陣列
const noteArray = noteToArray("半飯、不要辣"); // ['半飯', '不要辣']
```

## MealForm 更新

### 1. 型別定義

```typescript
export interface MenuFormValues {
  name: string;
  price: number;
  quantity: number;
  note: string | string[]; // 支援單個備註或多個備註
  description?: string;
  menu_item_id?: string;
  [x: string]: unknown;
}
```

### 2. 表單使用

```tsx
<Form.Item
  name="note"
  label="餐點備註"
  help="餐點的口味、尺寸等變化請使用 '備註' 欄位說明。可多選或輸入自訂備註。"
>
  <ComboInput
    options={[
      '小份', '中份', '大份',
      '半飯', '飯換菜', '多飯',
      '不要辣', '少辣', '中辣', '大辣',
      '去冰', '少冰', '正常冰',
    ]}
    multiple
    placeholder="例：半飯、不要辣..."
    allowClear
  />
</Form.Item>
```

## 訂單頁面更新指南

### 1. 更新 API 處理

提交訂單時需要轉換格式：

```typescript
import { noteToString } from '@/libs/note-helper';

const handleSubmit = async (values: MenuFormValues) => {
  const orderItem = {
    name: values.name,
    price: values.price,
    quantity: values.quantity,
    note: noteToString(values.note), // 轉換為字串
    menu_item_id: values.menu_item_id,
  };
  
  // 發送到 API...
};
```

### 2. 更新初始值處理

從 API 讀取時需要轉換為陣列（如果使用多選模式）：

```typescript
import { noteToArray } from '@/libs/note-helper';

const initialValues = {
  name: item.name,
  price: item.price,
  quantity: item.quantity,
  note: noteToArray(item.note), // 轉換為陣列用於編輯
  menu_item_id: item.menu_item_id,
};
```

### 3. 更新顯示邏輯

在表格中顯示備註：

```typescript
import { formatNote } from '@/libs/note-helper';

// 在 DataTable 的 columns 定義中
{
  title: '備註',
  key: 'note',
  render: (item) => formatNote(item.note) // 格式化顯示
}
```

### 4. 更新比較邏輯

比較訂單項目時：

```typescript
import { compareNotes } from '@/libs/note-helper';

function menuItemDiff(a: ILunchOrderItem, b: ILunchOrderItem): boolean {
  if (a.name && b.name && a.name !== b.name) return true;
  if (a.price && b.price && a.price !== b.price) return true;
  if (a.quantity && b.quantity && a.quantity !== b.quantity) return true;
  // 使用輔助函數比較備註
  if (!compareNotes(a.note, b.note)) return true;
  return false;
}
```

### 5. 更新合併邏輯

合併相同餐點的備註：

```typescript
import { mergeNotes, noteToString } from '@/libs/note-helper';

// 合併兩個訂單項目的備註
const mergedNote = mergeNotes(existingItem.note, newItem.note);
existingItem.note = noteToString(mergedNote);
```

## 完整更新清單

### 需要更新的檔案

1. ✅ `src/components/ui/ComboInput/index.tsx` - 新建
2. ✅ `src/components/form/controls/ComboInput.tsx` - 新建
3. ✅ `src/libs/note-helper.ts` - 新建
4. ✅ `src/app/lunch/(pages)/events/[id]/order/_components/MealForm.tsx` - 已更新
5. ⚠️ `src/app/lunch/(pages)/events/[id]/order/page.tsx` - 需要更新
6. ⚠️ `src/types/LunchEvent.ts` - 可能需要更新型別定義

### page.tsx 更新步驟

```typescript
// 1. 引入輔助函數
import { noteToString, noteToArray, formatNote, compareNotes, mergeNotes } from '@/libs/note-helper';

// 2. 更新型別定義（如果 ILunchOrderItem 的 note 欄位需要支援陣列）
interface ILunchOrderItem {
  // ...
  note?: string | string[];
}

// 3. 更新 menuItemDiff 函數
function menuItemDiff(a: ILunchOrderItem, b: ILunchOrderItem): boolean {
  // ... 其他比較邏輯
  if (!compareNotes(a.note, b.note)) return true;
  return false;
}

// 4. 更新新增訂單項目邏輯
const handleAddOrderItem = (values: MenuFormValues) => {
  const newItem = {
    ...values,
    note: noteToString(values.note), // 轉換為字串
  };
  
  // 如果需要合併相同餐點
  const existingItemIndex = orderItems.findIndex(/* ... */);
  if (existingItemIndex !== -1) {
    const mergedNote = mergeNotes(
      orderItems[existingItemIndex].note,
      values.note
    );
    orderItems[existingItemIndex].note = noteToString(mergedNote);
  }
};

// 5. 更新編輯訂單項目邏輯
const handleEditOrderItem = (item: ILunchOrderItem) => {
  const initialValues = {
    ...item,
    note: noteToArray(item.note), // 轉換為陣列用於編輯
  };
  // 打開編輯模態框...
};

// 6. 更新 DataTable 顯示
<DataTable
  columns={[
    // ...
    {
      title: '備註',
      key: 'note',
      render: (item) => formatNote(item.note) || '-'
    }
  ]}
/>
```

## 測試檢查清單

- [ ] 單選模式：能正常輸入和選擇
- [ ] 多選模式：能正常添加多個標籤
- [ ] 自訂輸入：能輸入不在選項中的值
- [ ] 過濾功能：輸入時能正確過濾選項
- [ ] 清空功能：清空按鈕正常工作
- [ ] 鍵盤操作：Enter、Backspace、Escape 正常
- [ ] 表單整合：能正確提交和驗證
- [ ] 儲存轉換：陣列正確轉換為字串儲存
- [ ] 讀取轉換：字串正確轉換為陣列編輯
- [ ] 顯示格式：備註在表格中正確顯示
- [ ] 比較邏輯：能正確比較備註變化
- [ ] 合併邏輯：相同餐點的備註能正確合併

## 注意事項

1. **資料庫儲存格式**：始終使用字串格式儲存（使用 `noteToString`）
2. **表單編輯格式**：多選模式時使用陣列格式（使用 `noteToArray`）
3. **顯示格式**：使用 `formatNote` 統一格式化顯示
4. **分隔符號**：支援 `,`、`，`、`、`、`/` 等多種分隔符號解析
5. **空值處理**：所有輔助函數都能正確處理 `undefined`、`null`、空字串

## 未來擴展

如果需要更複雜的備註管理，可以考慮：

1. 在資料庫新增 `JSON` 型別欄位儲存結構化備註
2. 支援備註的價格調整（例如：大份 +10元）
3. 支援備註的庫存管理
4. 備註的統計分析功能

# ComboInput 快速開始指南

## 🚀 立即測試

訪問測試頁面查看元件效果：
```
http://localhost:3000/dev/combo-input-test
```

## 📝 基本使用

### 1. 引入元件

```tsx
import ComboInput from '@/components/form/controls/ComboInput';
```

### 2. 單選模式

```tsx
const [value, setValue] = useState('');

<ComboInput
  value={value}
  onChange={(val) => setValue(val as string)}
  options={['選項1', '選項2', '選項3']}
  placeholder="請選擇或輸入..."
/>
```

### 3. 多選模式

```tsx
const [values, setValues] = useState<string[]>([]);

<ComboInput
  value={values}
  onChange={(val) => setValues(val as string[])}
  options={['選項1', '選項2', '選項3']}
  multiple
  placeholder="可多選或輸入自訂項目..."
/>
```

### 4. 在 Form 中使用

```tsx
import { Form } from '@/components/form';
import ComboInput from '@/components/form/controls/ComboInput';

<Form onFinish={(values) => console.log(values)}>
  <Form.Item
    name="notes"
    label="備註"
    rules={[{ required: true, message: '請至少選擇一項' }]}
  >
    <ComboInput
      options={['半飯', '不要辣', '去冰']}
      multiple
    />
  </Form.Item>
  
  <button type="submit" className="btn btn-primary">
    送出
  </button>
</Form>
```

## 🎯 實際應用：餐點訂購

### MealForm 已更新

`src/app/lunch/(pages)/events/[id]/order/_components/MealForm.tsx` 已經使用新元件：

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

### 資料處理

使用 `note-helper.ts` 處理備註：

```tsx
import { noteToString, noteToArray, formatNote } from '@/libs/note-helper';

// 提交時：陣列 → 字串
const submitData = {
  ...formValues,
  note: noteToString(formValues.note) // ['半飯', '不要辣'] → "半飯、不要辣"
};

// 編輯時：字串 → 陣列
const initialValues = {
  ...orderItem,
  note: noteToArray(orderItem.note) // "半飯、不要辣" → ['半飯', '不要辣']
};

// 顯示時：格式化
<span>{formatNote(item.note)}</span> // 統一顯示格式
```

## 🎨 自訂選項

### 帶標籤的選項

```tsx
<ComboInput
  options={[
    { value: 'xs', label: '小份 (Small)' },
    { value: 'md', label: '中份 (Medium)' },
    { value: 'lg', label: '大份 (Large)' },
  ]}
/>
```

### 調整下拉高度

```tsx
<ComboInput
  options={longOptionList}
  maxDropdownHeight={300} // 預設 200px
/>
```

### 不同尺寸

```tsx
<ComboInput size="sm" options={options} />
<ComboInput size="md" options={options} /> // 預設
<ComboInput size="lg" options={options} />
```

## ⌨️ 鍵盤操作

### 單選模式
- **Enter**: 關閉下拉選單
- **Escape**: 關閉下拉選單
- **輸入文字**: 自動過濾選項

### 多選模式
- **Enter**: 添加當前輸入為新標籤
- **Backspace**: 刪除最後一個標籤（輸入框為空時）
- **Escape**: 關閉下拉選單
- **輸入文字**: 自動過濾選項

## 📚 更多資源

- **完整文件**: `src/components/ui/ComboInput/README.md`
- **整合指南**: `docs/app/lunch/combo-input-integration.md`
- **實現總結**: `docs/app/lunch/combo-input-summary.md`
- **測試頁面**: `src/app/dev/combo-input-test/page.tsx`

## ❓ 常見問題

### Q: 如何初始化預設值？

```tsx
// 單選
<ComboInput value="中辣" onChange={...} />

// 多選
<ComboInput value={['半飯', '不要辣']} onChange={...} multiple />
```

### Q: 如何處理表單驗證？

```tsx
<Form.Item
  name="size"
  rules={[
    { required: true, message: '請選擇尺寸' },
  ]}
>
  <ComboInput options={['小份', '中份', '大份']} />
</Form.Item>
```

### Q: 如何儲存到資料庫？

```tsx
import { noteToString } from '@/libs/note-helper';

// 多選值轉換為字串儲存
const dataToSave = {
  note: noteToString(formValues.note)
};
```

### Q: 如何從資料庫讀取？

```tsx
import { noteToArray } from '@/libs/note-helper';

// 字串轉換為陣列用於編輯
const initialValues = {
  note: noteToArray(dbRecord.note)
};
```

## 🎉 開始使用

1. 訪問測試頁面體驗功能
2. 查看 MealForm 的實際應用
3. 根據需求在你的表單中使用
4. 使用 note-helper 處理資料轉換

祝使用愉快！

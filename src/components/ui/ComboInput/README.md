# ComboInput 元件

## 概述

`ComboInput` 是一個結合輸入框和下拉選單的複合元件，支援單選和多選模式。它允許用戶輸入自訂內容或從預設選項中選擇，並提供良好的用戶體驗。

## 特性

- ✅ **受控元件**：完全受控，可用於 Form 表單
- ✅ **單選/多選**：透過 `multiple` 屬性切換模式
- ✅ **自訂輸入**：允許輸入不在選項列表中的值
- ✅ **過濾功能**：輸入時自動過濾選項
- ✅ **標籤展示**：多選模式下以標籤形式展示已選項目
- ✅ **鍵盤操作**：支援 Enter、Backspace、Escape 等鍵盤操作
- ✅ **滾動列表**：選項過多時自動出現滾動條
- ✅ **清空功能**：快速清空已選內容
- ✅ **錯誤狀態**：支援表單驗證錯誤顯示

## 基本用法

### 單選模式（預設）

```tsx
import ComboInput from '@/components/form/controls/ComboInput';

function Example() {
  const [value, setValue] = useState('');

  return (
    <ComboInput
      value={value}
      onChange={setValue}
      options={['不要辣', '少辣', '中辣', '大辣']}
      placeholder="請選擇或輸入辣度..."
    />
  );
}
```

### 多選模式

```tsx
import ComboInput from '@/components/form/controls/ComboInput';

function Example() {
  const [values, setValues] = useState<string[]>([]);

  return (
    <ComboInput
      value={values}
      onChange={setValues}
      options={['半飯', '飯換菜', '不要辣', '少辣', '去冰']}
      multiple
      placeholder="請選擇或輸入備註..."
    />
  );
}
```

### 在 Form 中使用

```tsx
import { Form } from '@/components/form';
import ComboInput from '@/components/form/controls/ComboInput';

function MealForm() {
  return (
    <Form onFinish={(values) => console.log(values)}>
      {/* 單選模式 */}
      <Form.Item
        name="spicyLevel"
        label="辣度"
      >
        <ComboInput
          options={['不要辣', '少辣', '中辣', '大辣']}
          placeholder="請選擇辣度"
        />
      </Form.Item>

      {/* 多選模式 */}
      <Form.Item
        name="notes"
        label="餐點備註"
      >
        <ComboInput
          options={['半飯', '飯換菜', '不要辣', '多飯', '去冰', '少冰']}
          multiple
          placeholder="請選擇或輸入備註"
        />
      </Form.Item>
    </Form>
  );
}
```

## Props

### ComboInputProps

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `value` | `string \| string[]` | - | 當前值（單選為字串，多選為字串陣列） |
| `onChange` | `(value: string \| string[]) => void` | - | 值變化回調 |
| `options` | `(string \| ComboInputOption)[]` | `[]` | 選項列表 |
| `multiple` | `boolean` | `false` | 是否為多選模式 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 元件大小 |
| `allowClear` | `boolean` | `true` | 是否顯示清空按鈕 |
| `maxDropdownHeight` | `number` | `200` | 下拉選單最大高度（px） |
| `error` | `string \| string[]` | - | 錯誤訊息 |
| `placeholder` | `string` | `'請輸入或選擇...'` | 佔位符文字 |
| `disabled` | `boolean` | `false` | 是否禁用 |

### ComboInputOption

```typescript
interface ComboInputOption {
  value: string;    // 選項值
  label?: string;   // 選項顯示文字（可選，預設使用 value）
}
```

## 使用情境

### 1. 餐點備註（多選）

```tsx
<Form.Item name="mealNotes" label="餐點備註">
  <ComboInput
    options={[
      '半飯',
      '飯換菜',
      '多飯',
      '不要辣',
      '少辣',
      '中辣',
      '大辣',
      '去冰',
      '少冰',
      '正常冰',
    ]}
    multiple
    placeholder="可多選或自訂備註"
  />
</Form.Item>
```

### 2. 尺寸選擇（單選）

```tsx
<Form.Item name="size" label="餐點尺寸">
  <ComboInput
    options={['小份', '中份', '大份']}
    placeholder="請選擇尺寸"
  />
</Form.Item>
```

### 3. 帶有標籤的選項

```tsx
<Form.Item name="category" label="分類">
  <ComboInput
    options={[
      { value: 'main', label: '主餐' },
      { value: 'side', label: '配菜' },
      { value: 'drink', label: '飲料' },
      { value: 'dessert', label: '甜點' },
    ]}
  />
</Form.Item>
```

## 鍵盤操作

### 單選模式
- **Enter**: 關閉下拉選單
- **Escape**: 關閉下拉選單

### 多選模式
- **Enter**: 添加當前輸入值為新標籤（如果輸入框有內容）
- **Backspace**: 刪除最後一個標籤（當輸入框為空時）
- **Escape**: 關閉下拉選單

## 注意事項

1. **受控元件**: 必須提供 `value` 和 `onChange`，元件不會自行維護狀態
2. **多選模式**: 當 `multiple={true}` 時，`value` 必須是字串陣列
3. **選項過濾**: 輸入時會自動過濾選項，不區分大小寫
4. **自訂輸入**: 多選模式下按 Enter 可以添加不在選項中的自訂值
5. **滾動處理**: 選項超過 `maxDropdownHeight` 時自動出現滾動條

## 樣式自訂

元件使用 DaisyUI 的樣式系統，可以透過 `className` 進行額外的樣式調整：

```tsx
<ComboInput
  className="input-primary" // 使用主題色
  size="lg"                  // 大尺寸
  options={options}
/>
```

## 完整範例

```tsx
'use client';
import { Form } from '@/components/form';
import ComboInput from '@/components/form/controls/ComboInput';

export default function MealOrderForm() {
  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
    // {
    //   spicyLevel: '中辣',
    //   notes: ['半飯', '不要辣', '加蛋']
    // }
  };

  return (
    <Form
      onFinish={handleSubmit}
      initialValues={{
        spicyLevel: '',
        notes: []
      }}
    >
      <Form.Item
        name="spicyLevel"
        label="辣度"
        rules={[{ required: true, message: '請選擇辣度' }]}
      >
        <ComboInput
          options={['不要辣', '少辣', '中辣', '大辣']}
          placeholder="請選擇辣度"
        />
      </Form.Item>

      <Form.Item
        name="notes"
        label="餐點備註"
        help="可多選或輸入自訂備註"
      >
        <ComboInput
          options={[
            '半飯',
            '飯換菜',
            '多飯',
            '不要辣',
            '少辣',
            '中辣',
            '大辣',
          ]}
          multiple
          placeholder="請選擇或輸入備註"
          maxDropdownHeight={250}
        />
      </Form.Item>

      <button type="submit" className="btn btn-primary">
        送出訂單
      </button>
    </Form>
  );
}
```

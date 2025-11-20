# Form 組件使用指南

Form 是一個類似 Ant Design Form 的表單組件系統，提供了強大的表單驗證、狀態管理和事件處理功能。

## 特色功能

- 🎯 **類似 Ant Design Form 的 API 設計**
- ✅ **內建表單驗證系統**
- 🔄 **實時值變更監聽**
- 📝 **支援自定義表單控制項**
- 🎨 **基於 DaisyUI 的樣式系統**
- 📱 **響應式設計支援**
- 🔧 **TypeScript 完整支援**

## 基本使用

```tsx
import { Form, Input, Select } from '@/components/form';

function MyForm() {
  const handleFinish = (values) => {
    console.log('表單提交值:', values);
  };

  const handleValuesChange = (changedValues, allValues) => {
    console.log('值變更:', changedValues);
  };

  return (
    <Form
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
      initialValues={{ name: '', email: '' }}
    >
      <Form.Item name="name" label="姓名" required>
        <Input placeholder="請輸入姓名" />
      </Form.Item>

      <Form.Item
        name="email"
        label="電子郵件"
        required
        rules={[
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '請輸入有效的電子郵件' }
        ]}
      >
        <Input type="email" placeholder="請輸入電子郵件" />
      </Form.Item>

      <button type="submit" className="btn btn-primary">
        提交
      </button>
    </Form>
  );
}
```

## 驗證規則

Form 支援多種驗證規則：

### 基本驗證規則

```tsx
<Form.Item
  name="username"
  label="使用者名稱"
  rules={[
    { required: true, message: '使用者名稱為必填' },
    { min: 3, message: '最少需要3個字符' },
    { max: 20, message: '最多允許20個字符' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、數字和下劃線' }
  ]}
>
  <Input placeholder="請輸入使用者名稱" />
</Form.Item>
```

### 自定義驗證器

```tsx
const checkUsernameExists = async (value) => {
  // 模擬 API 調用
  const response = await fetch(`/api/check-username?username=${value}`);
  const data = await response.json();
  
  if (data.exists) {
    return '使用者名已存在';
  }
  return '';
};

<Form.Item
  name="username"
  label="使用者名稱"
  rules={[
    { required: true },
    { validator: checkUsernameExists }
  ]}
>
  <Input placeholder="請輸入使用者名稱" />
</Form.Item>
```

### 跨字段驗證

```tsx
const confirmPasswordValidator = async (value, allValues) => {
  if (value !== allValues.password) {
    return '兩次輸入的密碼不一致';
  }
  return '';
};

<Form.Item
  name="confirmPassword"
  label="確認密碼"
  rules={[
    { required: true },
    { validator: confirmPasswordValidator }
  ]}
>
  <Input type="password" placeholder="請再次輸入密碼" />
</Form.Item>
```

## 內建控制項

### Input - 文字輸入框

```tsx
<Form.Item name="name" label="姓名">
  <Input 
    placeholder="請輸入姓名"
    size="md"
    variant="bordered"
  />
</Form.Item>
```

### TextArea - 文字區域

```tsx
<Form.Item name="description" label="描述">
  <TextArea 
    placeholder="請輸入描述"
    rows={4}
    size="md"
  />
</Form.Item>
```

### Select - 下拉選擇

```tsx
<Form.Item name="country" label="國家">
  <Select
    placeholder="請選擇國家"
    options={[
      { label: '台灣', value: 'tw' },
      { label: '美國', value: 'us' },
      { label: '日本', value: 'jp' }
    ]}
  />
</Form.Item>
```

### NumberInput - 數字輸入

```tsx
<Form.Item name="age" label="年齡">
  <NumberInput 
    min={0}
    max={120}
    precision={0}
  />
</Form.Item>
```

### Checkbox - 複選框

```tsx
<Form.Item name="agree" label="同意條款">
  <Checkbox label="我同意使用條款和隱私政策" />
</Form.Item>
```

### RadioGroup - 單選按鈕組

```tsx
<Form.Item name="gender" label="性別">
  <RadioGroup
    options={[
      { label: '男性', value: 'male' },
      { label: '女性', value: 'female' },
      { label: '其他', value: 'other' }
    ]}
    direction="horizontal"
  />
</Form.Item>
```

## 自定義控制項

你可以建立自己的表單控制項，只需要遵循以下接口：

```tsx
interface CustomControlProps {
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string | string[];
}

function CustomControl({ value, onChange, onBlur, error }: CustomControlProps) {
  return (
    <div className={`custom-control ${error ? 'error' : ''}`}>
      <input
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        className="input input-bordered"
      />
      {error && <span className="text-error">{error}</span>}
    </div>
  );
}

// 使用自定義控制項
<Form.Item name="custom" label="自定義欄位">
  <CustomControl />
</Form.Item>
```

## 事件處理

### onFinish - 表單提交成功

```tsx
const handleFinish = (values) => {
  console.log('表單提交成功:', values);
  // 處理提交邏輯
};

<Form onFinish={handleFinish}>
  {/* 表單內容 */}
</Form>
```

### onFinishFailed - 表單提交失敗

```tsx
const handleFinishFailed = ({ values, errors }) => {
  console.log('表單提交失敗:', { values, errors });
  // 處理錯誤邏輯
};

<Form onFinishFailed={handleFinishFailed}>
  {/* 表單內容 */}
</Form>
```

### onValuesChange - 值變更監聽

```tsx
const handleValuesChange = (changedValues, allValues) => {
  console.log('變更的值:', changedValues);
  console.log('所有值:', allValues);
  
  // 例如：根據某個欄位的值動態調整其他欄位
  if (changedValues.country === 'tw') {
    // 自動設定時區
  }
};

<Form onValuesChange={handleValuesChange}>
  {/* 表單內容 */}
</Form>
```

## 驗證觸發時機

```tsx
<Form validateTrigger="onChange"> {/* 'onChange' | 'onBlur' | 'onSubmit' */}
  <Form.Item
    name="email"
    validateTrigger="onBlur" {/* 覆蓋全局設定 */}
  >
    <Input type="email" />
  </Form.Item>
</Form>
```

## 網格佈局

```tsx
<Form className="form-grid form-grid-cols-2">
  <Form.Item name="firstName" label="姓">
    <Input />
  </Form.Item>
  
  <Form.Item name="lastName" label="名">
    <Input />
  </Form.Item>
  
  {/* 跨列項目 */}
  <div className="col-span-1 md:col-span-2">
    <Form.Item name="address" label="地址">
      <TextArea />
    </Form.Item>
  </div>
</Form>
```

## 進階功能

### 動態表單項目

```tsx
function DynamicForm() {
  const [items, setItems] = useState([{ id: 1, name: 'item1' }]);

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id)) + 1;
    setItems([...items, { id: newId, name: `item${newId}` }]);
  };

  return (
    <Form>
      {items.map(item => (
        <Form.Item key={item.id} name={item.name} label={`項目 ${item.id}`}>
          <Input />
        </Form.Item>
      ))}
      <button type="button" onClick={addItem}>新增項目</button>
    </Form>
  );
}
```

### 使用 Hook 存取表單上下文

```tsx
import { useFormContext } from '@/components/form';

function CustomFormComponent() {
  const { values, errors, setFieldValue } = useFormContext();
  
  return (
    <div>
      <p>當前值: {JSON.stringify(values)}</p>
      <button onClick={() => setFieldValue('name', 'New Value')}>
        設定值
      </button>
    </div>
  );
}
```

## 樣式自定義

Form 基於 DaisyUI 設計，你可以使用以下 CSS 類別進行自定義：

```css
/* 表單項目間距 */
.form-dense .form-item {
  margin-bottom: 0.5rem;
}

/* 行內表單 */
.form-item-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 表單操作區域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid theme('colors.base-300');
  margin-top: 1.5rem;
}
```
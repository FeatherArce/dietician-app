# Form 動態表單使用指南

Form 支援類似 Ant Design Form.List 的動態表單功能，可以讓你輕鬆實現動態增減表單項目。

## 基本使用

```tsx
import Form, { Input } from '@/components/Form';

function DynamicForm() {
  return (
    <Form onFinish={(values) => console.log(values)}>
      <Form.List name="users">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }, index) => (
              <div key={key}>
                <Form.Item 
                  name={`users.${name}.name`} 
                  label={`使用者 ${index + 1} 姓名`}
                  required
                >
                  <Input placeholder="請輸入姓名" />
                </Form.Item>
                <button onClick={() => remove(name)}>刪除</button>
              </div>
            ))}
            <button onClick={() => add({ name: '' })}>新增使用者</button>
          </>
        )}
      </Form.List>
    </Form>
  );
}
```

## API 參考

### Form.List

| 屬性 | 類型 | 說明 | 默認值 |
|------|------|------|--------|
| name | string | 動態列表的字段名稱 | - |
| children | function | 渲染函數 | - |
| initialValue | any[] | 初始值 | [] |

### 渲染函數參數

```tsx
(fields, operations, meta) => ReactNode
```

#### fields: ListField[]
每個字段對象包含：
- `key`: 唯一標識符
- `name`: 字段在數組中的索引
- `fieldKey`: 用於 React key 的標識符

#### operations: ListOperations
- `add(defaultValue?, insertIndex?)`: 添加新項目
- `remove(index | index[])`: 移除項目（支援單個或多個）
- `move(from, to)`: 移動項目位置

#### meta
- `errors?`: 列表級別的驗證錯誤

## 字段命名規則

在動態表單中，使用點號分隔的路徑來命名字段：

```tsx
// 對於數組項目 users[0].name，使用：
name={`users.${name}.name`}

// 對於嵌套對象 users[0].address.street，使用：
name={`users.${name}.address.street`}
```

## 完整範例

### 1. 使用者管理表單

```tsx
function UserManagementForm() {
  return (
    <Form 
      onFinish={(values) => console.log('提交:', values)}
      initialValues={{ users: [{ name: '', email: '', age: 18 }] }}
    >
      <Form.List name="users">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }, index) => (
              <div key={key} className="border p-4 mb-4 rounded">
                <h4>使用者 {index + 1}</h4>
                
                <Form.Item 
                  name={`users.${name}.name`} 
                  label="姓名" 
                  required
                  rules={[{ required: true, message: '請輸入姓名' }]}
                >
                  <Input placeholder="請輸入姓名" />
                </Form.Item>
                
                <Form.Item 
                  name={`users.${name}.email`} 
                  label="電子郵件"
                  rules={[{ 
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                    message: '請輸入有效的電子郵件' 
                  }]}
                >
                  <Input type="email" placeholder="請輸入電子郵件" />
                </Form.Item>
                
                <Form.Item 
                  name={`users.${name}.age`} 
                  label="年齡"
                >
                  <NumberInput min={1} max={120} />
                </Form.Item>
                
                <button 
                  type="button" 
                  onClick={() => remove(name)}
                  disabled={fields.length === 1}
                >
                  刪除使用者
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={() => add({ name: '', email: '', age: 18 })}
            >
              + 新增使用者
            </button>
          </>
        )}
      </Form.List>
      
      <button type="submit">提交表單</button>
    </Form>
  );
}
```

### 2. 購物車表單

```tsx
function ShoppingCartForm() {
  return (
    <Form 
      onFinish={(values) => {
        const total = values.items?.reduce((sum, item) => 
          sum + (item.price * item.quantity || 0), 0
        ) || 0;
        console.log('訂單:', { ...values, total });
      }}
      onValuesChange={(changed, all) => {
        // 實時計算總金額
        if (Object.keys(changed).some(key => key.startsWith('items.'))) {
          const total = all.items?.reduce((sum, item) => 
            sum + (item.price * item.quantity || 0), 0
          ) || 0;
          console.log('總金額:', total);
        }
      }}
    >
      <Form.Item name="customerName" label="客戶姓名" required>
        <Input placeholder="請輸入客戶姓名" />
      </Form.Item>
      
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }, index) => (
              <div key={key} className="border p-4 mb-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h4>商品 {index + 1}</h4>
                  <button onClick={() => remove(name)}>移除</button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <Form.Item 
                    name={`items.${name}.name`} 
                    label="商品名稱" 
                    required
                  >
                    <Input placeholder="請輸入商品名稱" />
                  </Form.Item>
                  
                  <Form.Item 
                    name={`items.${name}.price`} 
                    label="單價" 
                    required
                  >
                    <NumberInput min={0.01} step={0.01} precision={2} />
                  </Form.Item>
                  
                  <Form.Item 
                    name={`items.${name}.quantity`} 
                    label="數量" 
                    required
                  >
                    <NumberInput min={1} precision={0} />
                  </Form.Item>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => add({ name: '', price: 0, quantity: 1 })}
            >
              + 新增商品
            </button>
          </>
        )}
      </Form.List>
    </Form>
  );
}
```

### 3. 標籤管理（支援排序）

```tsx
function TagManagerForm() {
  return (
    <Form initialValues={{ tags: ['React', 'TypeScript'] }}>
      <Form.List name="tags">
        {(fields, { add, remove, move }) => (
          <>
            {fields.map(({ key, name }, index) => (
              <div key={key} className="flex items-center gap-2 p-2">
                <Form.Item name={`tags.${name}`} className="flex-1">
                  <Input placeholder="請輸入標籤" />
                </Form.Item>
                
                {/* 排序按鈕 */}
                {index > 0 && (
                  <button onClick={() => move(index, index - 1)}>↑</button>
                )}
                {index < fields.length - 1 && (
                  <button onClick={() => move(index, index + 1)}>↓</button>
                )}
                
                <button onClick={() => remove(name)}>×</button>
              </div>
            ))}
            
            <button onClick={() => add('')}>+ 新增標籤</button>
          </>
        )}
      </Form.List>
    </Form>
  );
}
```

## 進階功能

### 插入項目到指定位置

```tsx
// 在開頭插入
add(defaultValue, 0)

// 在指定位置插入
add(defaultValue, insertIndex)
```

### 批量移除項目

```tsx
// 移除多個項目
remove([1, 3, 5])

// 移除單個項目
remove(2)
```

### 動態驗證

```tsx
<Form.Item
  name={`items.${name}.email`}
  rules={[
    { required: true },
    {
      validator: async (value, allValues) => {
        // 檢查是否重複
        const emails = allValues.items?.map(item => item.email) || [];
        const count = emails.filter(email => email === value).length;
        if (count > 1) {
          return '電子郵件不能重複';
        }
        return '';
      }
    }
  ]}
>
  <Input type="email" />
</Form.Item>
```

### 條件顯示

```tsx
{fields.map(({ key, name }, index) => (
  <div key={key}>
    <Form.Item name={`items.${name}.type`} label="類型">
      <Select options={[
        { label: '普通商品', value: 'normal' },
        { label: '特殊商品', value: 'special' }
      ]} />
    </Form.Item>
    
    {/* 根據類型條件顯示額外字段 */}
    <Form.Item name={`items.${name}.isSpecial`}>
      <Checkbox label="是否為特殊商品" />
    </Form.Item>
  </div>
))}
```

## 資料結構

動態表單的資料結構會自動對應到 JavaScript 陣列：

```javascript
// 表單值
{
  users: [
    { name: '張三', email: 'zhang@example.com', age: 25 },
    { name: '李四', email: 'li@example.com', age: 30 }
  ]
}

// 對應的字段名稱
'users.0.name'     // '張三'
'users.0.email'    // 'zhang@example.com'
'users.1.name'     // '李四'
```

## 注意事項

1. **字段命名**: 必須使用點號分隔的路徑格式 (`list.index.field`)
2. **key 屬性**: React 需要唯一的 key，Form.List 自動處理
3. **初始值**: 如果需要預設項目，在 `initialValues` 中設定陣列
4. **驗證**: 可以對單個字段或整個列表進行驗證
5. **性能**: 大量項目時建議使用虛擬滾動或分頁

這樣你就可以實現功能完整的動態表單了！
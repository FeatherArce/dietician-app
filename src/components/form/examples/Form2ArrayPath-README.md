# Form 陣列路徑支援說明

Form 現在完全支援陣列路徑語法，讓你可以更靈活地處理嵌套和動態表單結構。

## 🎯 支援的路徑格式

### 1. 字符串路徑（點號分隔）
```tsx
<Form.Item name="user.name" label="姓名">
  <Input />
</Form.Item>

<Form.Item name="users.0.email" label="第一個使用者的電子郵件">
  <Input />
</Form.Item>
```

### 2. 陣列路徑
```tsx
<Form.Item name={['user', 'name']} label="姓名">
  <Input />
</Form.Item>

<Form.Item name={['users', 0, 'email']} label="第一個使用者的電子郵件">
  <Input />
</Form.Item>
```

### 3. 混合使用
```tsx
// 在 Form.List 中，通常使用陣列路徑
<Form.List name="users">
  {(fields, { add, remove }) => (
    <>
      {fields.map(({ key, name }) => (
        <div key={key}>
          {/* 陣列路徑語法 */}
          <Form.Item name={['users', name, 'name']} label="姓名">
            <Input />
          </Form.Item>
          
          {/* 或者字符串路徑語法 */}
          <Form.Item name={`users.${name}.email`} label="電子郵件">
            <Input />
          </Form.Item>
        </div>
      ))}
    </>
  )}
</Form.List>
```

## 🚀 完整使用範例

### 基本陣列路徑表單

```tsx
import Form, { Input, Select } from '@/components/Form';

function ArrayPathForm() {
  return (
    <Form 
      onFinish={(values) => console.log(values)}
      initialValues={{
        users: [
          { name: '張三', profile: { age: 25, city: '台北' } }
        ]
      }}
    >
      <Form.List name="users">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }, index) => (
              <div key={key}>
                <h4>使用者 {index + 1}</h4>
                
                {/* 基本字段 */}
                <Form.Item 
                  name={['users', name, 'name']} 
                  label="姓名" 
                  required
                >
                  <Input placeholder="請輸入姓名" />
                </Form.Item>
                
                {/* 嵌套對象字段 */}
                <Form.Item 
                  name={['users', name, 'profile', 'age']} 
                  label="年齡"
                >
                  <NumberInput min={1} max={120} />
                </Form.Item>
                
                <Form.Item 
                  name={['users', name, 'profile', 'city']} 
                  label="城市"
                >
                  <Select
                    options={[
                      { label: '台北', value: '台北' },
                      { label: '台中', value: '台中' },
                      { label: '高雄', value: '高雄' }
                    ]}
                  />
                </Form.Item>
                
                <button onClick={() => remove(name)}>刪除</button>
              </div>
            ))}
            
            <button onClick={() => add({ 
              name: '', 
              profile: { age: 18, city: '台北' } 
            })}>
              新增使用者
            </button>
          </>
        )}
      </Form.List>
    </Form>
  );
}
```

### 深度嵌套表單

```tsx
function DeepNestedForm() {
  return (
    <Form onFinish={(values) => console.log(values)}>
      <Form.List name="departments">
        {(deptFields, deptOps) => (
          <>
            {deptFields.map(({ key: deptKey, name: deptName }, deptIndex) => (
              <div key={deptKey}>
                <h3>部門 {deptIndex + 1}</h3>
                
                <Form.Item 
                  name={['departments', deptName, 'name']} 
                  label="部門名稱"
                >
                  <Input />
                </Form.Item>
                
                {/* 嵌套員工列表 */}
                <Form.List name={['departments', deptName, 'employees']}>
                  {(empFields, empOps) => (
                    <>
                      {empFields.map(({ key: empKey, name: empName }, empIndex) => (
                        <div key={empKey}>
                          <h4>員工 {empIndex + 1}</h4>
                          
                          <Form.Item 
                            name={['departments', deptName, 'employees', empName, 'name']} 
                            label="員工姓名"
                          >
                            <Input />
                          </Form.Item>
                          
                          <Form.Item 
                            name={['departments', deptName, 'employees', empName, 'position']} 
                            label="職位"
                          >
                            <Input />
                          </Form.Item>
                          
                          {/* 嵌套技能列表 */}
                          <Form.List name={['departments', deptName, 'employees', empName, 'skills']}>
                            {(skillFields, skillOps) => (
                              <>
                                {skillFields.map(({ key: skillKey, name: skillName }) => (
                                  <Form.Item 
                                    key={skillKey}
                                    name={['departments', deptName, 'employees', empName, 'skills', skillName]}
                                    label={`技能 ${skillName + 1}`}
                                  >
                                    <Input />
                                  </Form.Item>
                                ))}
                                <button onClick={() => skillOps.add('')}>新增技能</button>
                              </>
                            )}
                          </Form.List>
                          
                          <button onClick={() => empOps.remove(empName)}>刪除員工</button>
                        </div>
                      ))}
                      <button onClick={() => empOps.add({ name: '', position: '', skills: [''] })}>
                        新增員工
                      </button>
                    </>
                  )}
                </Form.List>
                
                <button onClick={() => deptOps.remove(deptName)}>刪除部門</button>
              </div>
            ))}
            <button onClick={() => deptOps.add({ 
              name: '', 
              employees: [{ name: '', position: '', skills: [''] }] 
            })}>
              新增部門
            </button>
          </>
        )}
      </Form.List>
    </Form>
  );
}
```

## 🔧 路徑處理機制

### 內部路徑轉換
Form 會自動處理不同格式的路徑：

```tsx
// 這兩種寫法是等價的：
name={['users', 0, 'name']}      // 陣列路徑
name="users.0.name"              // 字符串路徑

// 內部都會轉換為字符串鍵: "users.0.name"
```

### 數據結構對應

```javascript
// 表單值結構
{
  users: [
    {
      name: '張三',
      profile: {
        age: 25,
        address: {
          city: '台北',
          district: '信義區'
        }
      }
    }
  ]
}

// 對應的路徑
['users', 0, 'name']                           // '張三'
['users', 0, 'profile', 'age']                // 25
['users', 0, 'profile', 'address', 'city']    // '台北'
```

## 🎨 最佳實踐

### 1. 路徑選擇建議

```tsx
// ✅ 推薦：在 Form.List 中使用陣列路徑
<Form.List name="items">
  {(fields, ops) => fields.map(({ key, name }) => (
    <Form.Item key={key} name={['items', name, 'title']}>
      <Input />
    </Form.Item>
  ))}
</Form.List>

// ✅ 也可以：在 Form.List 中使用字符串路徑  
<Form.List name="items">
  {(fields, ops) => fields.map(({ key, name }) => (
    <Form.Item key={key} name={`items.${name}.title`}>
      <Input />
    </Form.Item>
  ))}
</Form.List>

// ✅ 推薦：固定嵌套結構使用字符串路徑
<Form.Item name="user.profile.email">
  <Input />
</Form.Item>
```

### 2. 動態字段命名

```tsx
// 動態生成字段名稱
const generateFieldName = (listName: string, index: number, fieldName: string) => {
  return [listName, index, fieldName];
};

<Form.Item name={generateFieldName('users', index, 'name')}>
  <Input />
</Form.Item>
```

### 3. 條件字段顯示

```tsx
<Form.List name="products">
  {(fields, ops) => fields.map(({ key, name }, index) => (
    <div key={key}>
      <Form.Item name={['products', name, 'type']}>
        <Select options={[
          { label: '實體商品', value: 'physical' },
          { label: '數位商品', value: 'digital' }
        ]} />
      </Form.Item>
      
      {/* 條件顯示字段 */}
      <Form.Item 
        name={['products', name, 'weight']} 
        label="重量"
        // 可以通過 useFormContext 獲取值來決定是否顯示
      >
        <NumberInput />
      </Form.Item>
    </div>
  ))}
</Form.List>
```

## 🚨 注意事項

### 1. 類型安全
雖然支援陣列路徑，但要注意 TypeScript 類型推導：

```tsx
// 如果需要嚴格的類型檢查，建議定義接口
interface UserForm {
  users: Array<{
    name: string;
    email: string;
    profile: {
      age: number;
      city: string;
    };
  }>;
}

// 使用時可以進行類型斷言
const handleFinish = (values: UserForm) => {
  console.log(values.users[0].profile.age);
};
```

### 2. 性能考量
- 深度嵌套可能影響性能，建議控制嵌套層級（< 5 層）
- 大量動態字段時考慮虛擬滾動或分頁
- 複雜表單可以拆分為多個子表單

### 3. 驗證策略
```tsx
// 跨字段驗證
<Form.Item
  name={['users', name, 'email']}
  rules={[
    {
      validator: async (value, allValues) => {
        // 檢查當前使用者列表中是否有重複的電子郵件
        const userEmails = allValues.users?.map(user => user.email) || [];
        const duplicates = userEmails.filter(email => email === value).length;
        
        if (duplicates > 1) {
          return '電子郵件不能重複';
        }
        return '';
      }
    }
  ]}
>
  <Input />
</Form.Item>
```

現在 Form 已經完全支援陣列路徑，你可以更靈活地處理複雜的嵌套表單結構了！
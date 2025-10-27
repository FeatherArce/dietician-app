import React from 'react';
import Form2 from '@/components/form2';
import Input from '@/components/form2/controls/Input';
import NumberInput from '@/components/form2/controls/NumberInput';

// 簡化的動態表單範例 - 僅使用字符串路徑
export function SimpleDynamicForm() {
  const handleFinish = (values: any) => {
    console.log('表單提交:', values);
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log('值變更:', changedValues, allValues);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">動態用戶表單</h2>

      <Form2
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        initialValues={{
          users: [
            { name: '張三', email: 'zhang@example.com', age: 25 }
          ]
        }}
      >
        <Form2.List name="users">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }, index) => (
                <div key={key} className="border border-base-300 rounded-lg p-4 mb-4 bg-base-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">用戶 {index + 1}</h4>
                    <button
                      type="button"
                      className="btn btn-sm btn-error"
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                    >
                      刪除
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Form2.Item
                      name={`users.${name}.name`}
                      label="姓名"
                      required
                      rules={[{ required: true, message: '請輸入姓名' }]}
                    >
                      <Input placeholder="請輸入姓名" />
                    </Form2.Item>

                    <Form2.Item
                      name={`users.${name}.email`}
                      label="電子郵件"
                      required
                      rules={[
                        { required: true, message: '請輸入電子郵件' },
                        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '請輸入有效的電子郵件' }
                      ]}
                    >
                      <Input type="email" placeholder="請輸入電子郵件" />
                    </Form2.Item>

                    <Form2.Item
                      name={`users.${name}.age`}
                      label="年齡"
                      rules={[
                        { min: 1, message: '年齡必須大於0' },
                        { max: 150, message: '年齡必須小於150' }
                      ]}
                    >
                      <NumberInput min={1} max={150} />
                    </Form2.Item>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-secondary btn-outline w-full"
                onClick={() => add({ name: '', email: '', age: undefined })}
              >
                + 新增用戶
              </button>
            </>
          )}
        </Form2.List>

        <div className="mt-6 flex gap-4">
          <button type="submit" className="btn btn-primary">
            提交表單
          </button>
        </div>
      </Form2>
    </div>
  );
}

// 購物車動態表單範例
export function ShoppingCartForm() {
  const handleFinish = (values: any) => {
    const total = values.items?.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity || 0);
    }, 0) || 0;

    console.log('購物車提交:', { ...values, total });
    alert(`訂單總金額: $${total}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">購物車表單</h2>

      <Form2
        onFinish={handleFinish}
        onValuesChange={(changed, all) => {
          // 自動計算總金額
          if (changed.items || Object.keys(changed).some(key => key.startsWith('items.'))) {
            const total = (all.items as Array<any> || [])?.reduce((sum: number, item: any) => {
              return sum + (item.price * item.quantity || 0);
            }, 0) || 0;
            console.log('目前總金額:', total);
          }
        }}
        initialValues={{
          customerName: '',
          items: [
            { name: '商品A', price: 100, quantity: 1 }
          ]
        }}
      >
        <Form2.Item
          name="customerName"
          label="客戶姓名"
          required
          rules={[{ required: true, message: '請輸入客戶姓名' }]}
        >
          <Input placeholder="請輸入客戶姓名" />
        </Form2.Item>

        <div className="divider">商品列表</div>

        <Form2.List name="items">
          {(fields, { add, remove }) => (
            <>
              <div className="space-y-4">
                {fields.map(({ key, name }, index) => (
                  <div key={key} className="bg-base-50 border border-base-300 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">商品 {index + 1}</h4>
                      <button
                        type="button"
                        className="btn btn-xs btn-error"
                        onClick={() => remove(name)}
                        disabled={fields.length === 1}
                      >
                        移除
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <Form2.Item
                          name={`items.${name}.name`}
                          label="商品名稱"
                          required
                          rules={[{ required: true, message: '請輸入商品名稱' }]}
                        >
                          <Input placeholder="請輸入商品名稱" />
                        </Form2.Item>
                      </div>

                      <Form2.Item
                        name={`items.${name}.price`}
                        label="單價"
                        required
                        rules={[
                          { required: true, message: '請輸入單價' },
                          { min: 0.01, message: '單價必須大於0' }
                        ]}
                      >
                        <NumberInput min={0.01} step={0.01} precision={2} />
                      </Form2.Item>

                      <Form2.Item
                        name={`items.${name}.quantity`}
                        label="數量"
                        required
                        rules={[
                          { required: true, message: '請輸入數量' },
                          { min: 1, message: '數量必須大於0' }
                        ]}
                      >
                        <NumberInput min={1} precision={0} />
                      </Form2.Item>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary btn-outline flex-1"
                  onClick={() => add({ name: '', price: 0, quantity: 1 })}
                >
                  + 新增商品
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => add({ name: '熱銷商品', price: 299, quantity: 1 }, 0)}
                >
                  插入熱銷商品
                </button>
              </div>
            </>
          )}
        </Form2.List>

        <div className="mt-6 flex gap-4">
          <button type="submit" className="btn btn-primary">
            確認訂單
          </button>
        </div>
      </Form2>
    </div>
  );
}

// 標籤管理動態表單
export function TagManagerForm() {
  const handleFinish = (values: any) => {
    console.log('標籤管理提交:', values);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">標籤管理</h2>

      <Form2
        onFinish={handleFinish}
        initialValues={{
          title: '',
          tags: ['前端', '開發']
        }}
      >
        <Form2.Item
          name="title"
          label="標題"
          required
          rules={[{ required: true, message: '請輸入標題' }]}
        >
          <Input placeholder="請輸入標題" />
        </Form2.Item>

        <div className="divider">標籤列表</div>

        <Form2.List name="tags">
          {(fields, { add, remove, move }) => (
            <>
              <div className="space-y-3">
                {fields.map(({ key, name }, index) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-base-100 rounded-lg border">
                    <div className="flex-1">
                      <Form2.Item
                        name={`tags.${name}`}
                        required
                        rules={[{ required: true, message: '請輸入標籤' }]}
                      >
                        <Input placeholder="請輸入標籤" size="sm" />
                      </Form2.Item>
                    </div>

                    <div className="flex gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost"
                          onClick={() => move(index, index - 1)}
                          title="上移"
                        >
                          ↑
                        </button>
                      )}
                      {index < fields.length - 1 && (
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost"
                          onClick={() => move(index, index + 1)}
                          title="下移"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-xs btn-error"
                        onClick={() => remove(name)}
                        disabled={fields.length === 1}
                        title="刪除"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary btn-outline btn-sm flex-1"
                  onClick={() => add('')}
                >
                  + 新增標籤
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => add('React', 0)}
                >
                  插入 React
                </button>
              </div>
            </>
          )}
        </Form2.List>

        <div className="mt-6">
          <button type="submit" className="btn btn-primary w-full">
            保存設定
          </button>
        </div>
      </Form2>
    </div>
  );
}
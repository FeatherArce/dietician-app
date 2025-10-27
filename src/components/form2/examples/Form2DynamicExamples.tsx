'use client';

import React from 'react';
import { Form2 } from '@/components/form2';
import Input from '@/components/form2/controls/Input';
import Select from '@/components/form2/controls/Select';
import NumberInput from '@/components/form2/controls/NumberInput';

// 基本動態表單範例
export function BasicDynamicForm() {
  const handleFinish = (values: any) => {
    console.log('表單提交:', values);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">基本動態表單</h2>

      <Form2
        onFinish={handleFinish}
        initialValues={{
          users: [
            { name: '張三', email: 'zhang@example.com', age: 25 }
          ]
        }}
        onFinishFailed={(errorInfos) => {
          console.log('Form errors', errorInfos)
        }}
      >
        <Form2.List name="users">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey }, index) => (
                <div key={key} className="border border-base-300 rounded-lg p-4 mb-4 bg-base-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">用戶 {index + 1}</h4>
                    <button
                      type="button"
                      className="btn btn-sm btn-error"
                      onClick={() => remove(name)}
                    >
                      刪除
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Form2.Item
                      name={[name, 'name']}
                      label="姓名"
                      required
                      rules={[{ required: true, message: '請輸入姓名' }]}
                    >
                      <Input placeholder="請輸入姓名" />
                    </Form2.Item>

                    <Form2.Item
                      name={[name, 'email']}
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
                      name={[name, 'age']}
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

// 進階動態表單範例 - 嵌套動態表單
export function AdvancedDynamicForm() {
  const handleFinish = (values: any) => {
    console.log('進階表單提交:', values);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">進階動態表單 - 專案管理</h2>

      <Form2
        onFinish={handleFinish}
        initialValues={{
          projectName: '',
          projects: [
            {
              name: '網站開發',
              description: '企業官網開發項目',
              tasks: [
                { title: '需求分析', hours: 8 },
                { title: '設計稿製作', hours: 16 }
              ]
            }
          ]
        }}
      >
        <Form2.Item
          name="projectName"
          label="專案組名稱"
          required
          rules={[{ required: true, message: '請輸入專案組名稱' }]}
        >
          <Input placeholder="請輸入專案組名稱" />
        </Form2.Item>

        <Form2.List name="projects">
          {(projectFields, projectOps) => (
            <>
              {projectFields.map(({ key: projectKey, name: projectName }, projectIndex) => (
                <div key={projectKey} className="border-2 border-primary rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">專案 {projectIndex + 1}</h3>
                    <div className="flex gap-2">
                      {projectIndex > 0 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => projectOps.move(projectIndex, projectIndex - 1)}
                        >
                          ↑
                        </button>
                      )}
                      {projectIndex < projectFields.length - 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => projectOps.move(projectIndex, projectIndex + 1)}
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-error"
                        onClick={() => projectOps.remove(projectName)}
                      >
                        刪除專案
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Form2.Item
                      name={[projectName, 'name']}
                      label="專案名稱"
                      required
                      rules={[{ required: true, message: '請輸入專案名稱' }]}
                    >
                      <Input placeholder="請輸入專案名稱" />
                    </Form2.Item>

                    <Form2.Item
                      name={[projectName, 'status']}
                      label="專案狀態"
                    >
                      <Select
                        placeholder="請選擇專案狀態"
                        options={[
                          { label: '規劃中', value: 'planning' },
                          { label: '進行中', value: 'in-progress' },
                          { label: '已完成', value: 'completed' },
                          { label: '已暫停', value: 'paused' }
                        ]}
                      />
                    </Form2.Item>
                  </div>

                  <Form2.Item
                    name={[projectName, 'description']}
                    label="專案描述"
                  >
                    <Input placeholder="請輸入專案描述" />
                  </Form2.Item>

                  {/* 嵌套的任務列表 */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">任務列表</h4>
                    <Form2.List name={[projectName, 'tasks']}>
                      {(taskFields, taskOps) => (
                        <>
                          {taskFields.map(({ key: taskKey, name: taskName }, taskIndex) => (
                            <div key={taskKey} className="bg-base-100 border border-base-300 rounded p-4 mb-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">任務 {taskIndex + 1}</span>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-error"
                                  onClick={() => taskOps.remove(taskName)}
                                >
                                  刪除
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Form2.Item
                                  name={[taskName, 'title']}
                                  label="任務標題"
                                  required
                                  rules={[{ required: true, message: '請輸入任務標題' }]}
                                >
                                  <Input placeholder="請輸入任務標題" size="sm" />
                                </Form2.Item>

                                <Form2.Item
                                  name={[taskName, 'hours']}
                                  label="預估時數"
                                  rules={[{ min: 0.5, message: '時數必須大於0.5' }]}
                                >
                                  <NumberInput min={0.5} step={0.5} size="sm" />
                                </Form2.Item>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            className="btn btn-sm btn-ghost btn-outline w-full"
                            onClick={() => taskOps.add({ title: '', hours: 1 })}
                          >
                            + 新增任務
                          </button>
                        </>
                      )}
                    </Form2.List>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-secondary btn-outline w-full"
                onClick={() => projectOps.add({
                  name: '',
                  description: '',
                  status: 'planning',
                  tasks: [{ title: '', hours: 1 }]
                })}
              >
                + 新增專案
              </button>
            </>
          )}
        </Form2.List>

        <div className="mt-8 flex gap-4">
          <button type="submit" className="btn btn-primary">
            提交所有專案
          </button>
          <button type="button" className="btn btn-ghost">
            重置表單
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
          if (changed.items) {
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
                          name={[name, 'name']}
                          label="商品名稱"
                          required
                          rules={[{ required: true, message: '請輸入商品名稱' }]}
                        >
                          <Input placeholder="請輸入商品名稱" />
                        </Form2.Item>
                      </div>

                      <Form2.Item
                        name={[name, 'price']}
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
                        name={[name, 'quantity']}
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
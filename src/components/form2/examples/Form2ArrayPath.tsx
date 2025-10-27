import React from 'react';
import { Form2 } from '@/components/form2';
import Input from '@/components/form2/controls/Input';
import Select from '@/components/form2/controls/Select';
import NumberInput from '@/components/form2/controls/NumberInput';

// 使用陣列路徑的動態表單範例
export function ArrayPathDynamicForm() {
  const handleFinish = (values: any) => {
    console.log('表單提交:', values);
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log('值變更:', changedValues, allValues);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">陣列路徑動態表單</h2>

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
                    {/* 使用陣列路徑語法 */}
                    <Form2.Item
                      name={['users', name, 'name']}
                      label="姓名"
                      required
                      rules={[{ required: true, message: '請輸入姓名' }]}
                    >
                      <Input placeholder="請輸入姓名" />
                    </Form2.Item>

                    <Form2.Item
                      name={['users', name, 'email']}
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
                      name={['users', name, 'age']}
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

// 嵌套動態表單範例
export function NestedDynamicForm() {
  const handleFinish = (values: any) => {
    console.log('嵌套表單提交:', values);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">嵌套動態表單 - 專案管理</h2>

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
                      name={['projects', projectName, 'name']}
                      label="專案名稱"
                      required
                      rules={[{ required: true, message: '請輸入專案名稱' }]}
                    >
                      <Input placeholder="請輸入專案名稱" />
                    </Form2.Item>

                    <Form2.Item
                      name={['projects', projectName, 'status']}
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
                    name={['projects', projectName, 'description']}
                    label="專案描述"
                  >
                    <Input placeholder="請輸入專案描述" />
                  </Form2.Item>

                  {/* 嵌套的任務列表 */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">任務列表</h4>
                    <Form2.List name={['projects', projectName, 'tasks']}>
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
                                  name={['projects', projectName, 'tasks', taskName, 'title']}
                                  label="任務標題"
                                  required
                                  rules={[{ required: true, message: '請輸入任務標題' }]}
                                >
                                  <Input placeholder="請輸入任務標題" size="sm" />
                                </Form2.Item>

                                <Form2.Item
                                  name={['projects', projectName, 'tasks', taskName, 'hours']}
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

// 混合路徑範例（字符串路徑和陣列路徑）
export function MixedPathForm() {
  const handleFinish = (values: any) => {
    console.log('混合路徑表單提交:', values);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">混合路徑表單</h2>

      <Form2
        onFinish={handleFinish}
        initialValues={{
          basicInfo: {
            name: '',
            email: ''
          },
          contacts: [
            { type: 'phone', value: '0912345678' }
          ]
        }}
      >
        {/* 使用字符串路徑 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">基本資料</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form2.Item
              name="basicInfo.name"
              label="姓名"
              required
            >
              <Input placeholder="請輸入姓名" />
            </Form2.Item>

            <Form2.Item
              name="basicInfo.email"
              label="電子郵件"
              rules={[{
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '請輸入有效的電子郵件'
              }]}
            >
              <Input type="email" placeholder="請輸入電子郵件" />
            </Form2.Item>
          </div>
        </div>

        {/* 使用陣列路徑 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">聯絡方式</h3>
          <Form2.List name="contacts">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }, index) => (
                  <div key={key} className="flex gap-3 items-end mb-3">
                    <div className="flex-1">
                      <Form2.Item
                        name={['contacts', name, 'type']}
                        label="類型"
                      >
                        <Select
                          options={[
                            { label: '電話', value: 'phone' },
                            { label: 'Line', value: 'line' },
                            { label: 'WeChat', value: 'wechat' },
                            { label: 'Telegram', value: 'telegram' }
                          ]}
                        />
                      </Form2.Item>
                    </div>

                    <div className="flex-2">
                      <Form2.Item
                        name={['contacts', name, 'value']}
                        label="值"
                        required
                      >
                        <Input placeholder="請輸入聯絡方式" />
                      </Form2.Item>
                    </div>

                    <button
                      type="button"
                      className="btn btn-error btn-sm mb-2"
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                    >
                      刪除
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary btn-outline btn-sm"
                  onClick={() => add({ type: 'phone', value: '' })}
                >
                  + 新增聯絡方式
                </button>
              </>
            )}
          </Form2.List>
        </div>

        <div className="mt-6">
          <button type="submit" className="btn btn-primary">
            提交表單
          </button>
        </div>
      </Form2>
    </div>
  );
}
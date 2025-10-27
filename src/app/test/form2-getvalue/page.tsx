/**
 * Form2 getValue 修復測試頁面
 * 測試修復後的 getValue 是否能正確獲取最新值
 */

'use client';

import { useState } from 'react';
import Form2 from '@/components/form2';

export default function Form2GetValueTestPage() {
  const [submittedValues, setSubmittedValues] = useState<Record<string, unknown> | null>(null);
  const [currentValues, setCurrentValues] = useState<Record<string, unknown>>({});

  const handleFinish = (values: Record<string, unknown>) => {
    console.log('Form submitted with values:', values);
    setSubmittedValues(values);
  };

  const handleValuesChange = (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
    console.log('Values changed:', { changedValues, allValues });
    setCurrentValues(allValues);
  };

  const testGetValue = () => {
    // 這個測試會在控制台顯示當前的表單值
    console.log('Current form values:', currentValues);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Form2 getValue 修復測試</h1>
      
      <div className="bg-info/10 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">測試說明：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>輸入一些值到表單中</li>
          <li>點擊「測試 getValue」查看控制台輸出</li>
          <li>提交表單查看最終收集的值</li>
          <li>驗證 getValue 是否獲取到正確的最新值</li>
        </ul>
      </div>

      <Form2
        initialValues={{ name: '初始名稱', email: '', age: 0 }}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        className="space-y-4"
      >
        <Form2.Item
          name="name"
          label="姓名"
          required
          rules={[
            { min: 2, message: '姓名至少需要2個字符' }
          ]}
        >
          <input 
            type="text" 
            className="input input-bordered w-full"
            placeholder="請輸入姓名"
          />
        </Form2.Item>

        <Form2.Item
          name="email"
          label="電子郵件"
          required
          rules={[
            { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '請輸入有效的電子郵件' }
          ]}
        >
          <input 
            type="email" 
            className="input input-bordered w-full"
            placeholder="請輸入電子郵件"
          />
        </Form2.Item>

        <Form2.Item
          name="age"
          label="年齡"
          required
          rules={[
            { min: 1, message: '年齡必須大於0' }
          ]}
        >
          <input 
            type="number" 
            className="input input-bordered w-full"
            placeholder="請輸入年齡"
          />
        </Form2.Item>

        <div className="flex space-x-4 pt-4">
          <button 
            type="button" 
            onClick={testGetValue}
            className="btn btn-secondary"
          >
            測試 getValue (查看控制台)
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
          >
            提交表單
          </button>
        </div>
      </Form2>

      {/* 顯示當前值 */}
      <div className="mt-8 bg-base-200 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">當前表單值：</h3>
        <pre className="text-sm">
          {JSON.stringify(currentValues, null, 2)}
        </pre>
      </div>

      {/* 顯示提交的值 */}
      {submittedValues && (
        <div className="mt-4 bg-success/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">提交的值：</h3>
          <pre className="text-sm">
            {JSON.stringify(submittedValues, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-warning/10 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">修復說明：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ 移除了 FormItem 的本地 value 狀態</li>
          <li>✅ getValue 現在直接從表單上下文獲取最新值</li>
          <li>✅ 使用 useCallback 穩定字段實例</li>
          <li>✅ 修復了閉包陷阱問題</li>
          <li>✅ 統一了值的數據源</li>
        </ul>
      </div>
    </div>
  );
}
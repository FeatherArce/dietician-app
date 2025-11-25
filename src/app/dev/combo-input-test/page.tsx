'use client';
import { Form } from '@/components/form';
import ComboInput from '@/components/form/controls/ComboInput';
import { useState } from 'react';

/**
 * ComboInput 元件測試頁面
 * 展示單選和多選模式的使用方式
 */
export default function ComboInputTestPage() {
  const [singleValue, setSingleValue] = useState('');
  const [multipleValue, setMultipleValue] = useState<string[]>([]);

  const handleSingleChange = (value: string | string[]) => {
    setSingleValue(typeof value === 'string' ? value : value.join('、'));
  };

  const handleMultipleChange = (value: string | string[]) => {
    setMultipleValue(Array.isArray(value) ? value : [value]);
  };

  const handleFormSubmit = (values: any) => {
    console.log('Form submitted:', values);
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">ComboInput 元件測試</h1>

      {/* 獨立元件測試 */}
      <div className="space-y-8 mb-12">
        <section className="card bg-base-200 p-6">
          <h2 className="text-2xl font-semibold mb-4">1. 單選模式（獨立）</h2>
          <div className="space-y-2">
            <label className="label">
              <span className="label-text">辣度選擇</span>
            </label>
            <ComboInput
              value={singleValue}
              onChange={handleSingleChange}
              options={['不要辣', '少辣', '中辣', '大辣']}
              placeholder="請選擇或輸入辣度..."
            />
            <p className="text-sm text-base-content/70 mt-2">
              當前值: <code className="bg-base-300 px-2 py-1 rounded">{singleValue || '(空)'}</code>
            </p>
          </div>
        </section>

        <section className="card bg-base-200 p-6">
          <h2 className="text-2xl font-semibold mb-4">2. 多選模式（獨立）</h2>
          <div className="space-y-2">
            <label className="label">
              <span className="label-text">餐點備註</span>
            </label>
            <ComboInput
              value={multipleValue}
              onChange={handleMultipleChange}
              options={[
                '小份',
                '中份',
                '大份',
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
              placeholder="可多選或輸入自訂備註..."
              maxDropdownHeight={250}
            />
            <p className="text-sm text-base-content/70 mt-2">
              當前值: <code className="bg-base-300 px-2 py-1 rounded">
                {multipleValue.length > 0 ? JSON.stringify(multipleValue) : '(空)'}
              </code>
            </p>
          </div>
        </section>
      </div>

      {/* Form 整合測試 */}
      <div className="divider">Form 整合測試</div>

      <section className="card bg-base-200 p-6">
        <h2 className="text-2xl font-semibold mb-4">3. 在 Form 中使用</h2>
        <Form
          onFinish={handleFormSubmit}
          initialValues={{
            spicyLevel: '',
            size: '',
            notes: [],
          }}
        >
          {/* 單選：辣度 */}
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

          {/* 單選：尺寸 */}
          <Form.Item
            name="size"
            label="尺寸"
            rules={[{ required: true, message: '請選擇尺寸' }]}
          >
            <ComboInput
              options={[
                { value: 'small', label: '小份' },
                { value: 'medium', label: '中份' },
                { value: 'large', label: '大份' },
              ]}
              placeholder="請選擇尺寸"
            />
          </Form.Item>

          {/* 多選：備註 */}
          <Form.Item
            name="notes"
            label="餐點備註"
            help="可多選或輸入自訂備註。按 Enter 可添加自訂項目。"
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
                '去冰',
                '少冰',
                '正常冰',
              ]}
              multiple
              placeholder="例：半飯、不要辣..."
              maxDropdownHeight={200}
            />
          </Form.Item>

          <div className="flex gap-2 mt-6">
            <button type="submit" className="btn btn-primary">
              送出表單
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSingleValue('');
                setMultipleValue([]);
              }}
            >
              重置獨立元件
            </button>
          </div>
        </Form>
      </section>

      {/* 使用說明 */}
      <div className="divider">使用說明</div>

      <section className="card bg-base-100 p-6">
        <h2 className="text-2xl font-semibold mb-4">操作指南</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">單選模式</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>點擊輸入框或下拉箭頭打開選項列表</li>
              <li>輸入文字可以過濾選項</li>
              <li>點擊選項或直接輸入自訂值</li>
              <li>按 Enter 或 Escape 關閉選項列表</li>
              <li>點擊清空按鈕快速清除內容</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">多選模式</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>點擊輸入框或下拉箭頭打開選項列表</li>
              <li>點擊選項添加標籤（再次點擊取消選擇）</li>
              <li>輸入自訂內容後按 Enter 添加為新標籤</li>
              <li>輸入框為空時按 Backspace 刪除最後一個標籤</li>
              <li>點擊標籤上的 × 移除該標籤</li>
              <li>點擊清空按鈕快速清除所有標籤</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">特性</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✅ 完全受控元件，可整合到 Form 表單</li>
              <li>✅ 支援選項過濾（不區分大小寫）</li>
              <li>✅ 支援自訂輸入（不限於預設選項）</li>
              <li>✅ 選項過多時自動滾動</li>
              <li>✅ 完整的鍵盤操作支援</li>
              <li>✅ 支援表單驗證和錯誤顯示</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

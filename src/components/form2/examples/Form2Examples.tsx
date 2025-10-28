'use client';
/**
 * Form2 組件使用示例
 * 
 * 這個文件展示了如何使用 Form2 組件系統
 */

import React from 'react';
import { Form2 } from '@/components/form2';
import Input from '@/components/form2/controls/Input';
import Select from '@/components/form2/controls/Select';
import NumberInput from '@/components/form2/controls/NumberInput';
import TextArea from '@/components/form2/controls/TextArea';
import Checkbox from '@/components/form2/controls/Checkbox';
import RadioGroup from '@/components/form2/controls/RadioGroup';

// 基本使用示例
export function BasicFormExample() {
  const handleFinish = (values: any) => {
    console.log('表單提交值:', values);
  };

  const handleFinishFailed = (errorInfo: any) => {
    console.log('表單驗證失敗:', errorInfo);
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log('值變更:', changedValues, '所有值:', allValues);
  };

  return (
    <div className="max-w-md mx-auto">
      <Form2
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        // onValuesChange={handleValuesChange}
        initialValues={{
          username: '',
          age: 18,
          gender: 'male',
          agree: false
        }}
      >
        <Form2.Item
          name="username"
          label="用戶名稱"
          required
          rules={[
            { min: 3, message: '用戶名至少需要3個字符' },
            { max: 20, message: '用戶名最多20個字符' }
          ]}
        >
          <Input placeholder="請輸入用戶名稱" />
        </Form2.Item>

        <Form2.Item
          name="email"
          label="電子郵件"
          required
          rules={[
            {
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '請輸入有效的電子郵件格式'
            }
          ]}
        >
          <Input type="email" placeholder="請輸入電子郵件" />
        </Form2.Item>

        <Form2.Item
          name="age"
          label="年齡"
          required
          rules={[
            {
              validator: async (value) => {
                const num = Number(value);
                if (isNaN(num)) return '年齡必須是數字';
                if (num < 18) return '年齡必須大於18歲';
                if (num > 100) return '年齡必須小於100歲';
                return '';
              }
            }
          ]}
        >
          <NumberInput min={1} max={100} />
        </Form2.Item>

        <Form2.Item
          name="gender"
          label="性別"
          required
        >
          <RadioGroup
            options={[
              { label: '男性', value: 'male' },
              { label: '女性', value: 'female' },
              { label: '其他', value: 'other' }
            ]}
            direction="horizontal"
          />
        </Form2.Item>

        <Form2.Item
          name="bio"
          label="個人簡介"
          help="簡單介紹一下自己"
        >
          <TextArea placeholder="請輸入個人簡介" rows={3} />
        </Form2.Item>

        <Form2.Item
          name="agree"
          required
          rules={[
            {
              validator: async (value) => {
                if (!value) return '請同意使用條款';
                return '';
              }
            }
          ]}
        >
          <Checkbox label="我同意使用條款和隱私政策" />
        </Form2.Item>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost">
            重置
          </button>
          <button type="submit" className="btn btn-primary">
            提交
          </button>
        </div>
      </Form2>
    </div>
  );
}

// 動態表單示例
export function DynamicFormExample() {
  const [formItems, setFormItems] = React.useState([
    { id: 1, name: 'item1', label: '項目 1' }
  ]);

  const addFormItem = () => {
    const newId = Math.max(...formItems.map(item => item.id)) + 1;
    setFormItems([
      ...formItems,
      { id: newId, name: `item${newId}`, label: `項目 ${newId}` }
    ]);
  };

  const removeFormItem = (id: number) => {
    setFormItems(formItems.filter(item => item.id !== id));
  };

  const handleFinish = (values: any) => {
    console.log('動態表單提交值:', values);
  };

  return (
    <div className="max-w-md mx-auto">
      <Form2 onFinish={handleFinish}>
        {formItems.map((item) => (
          <div key={item.id} className="flex items-end space-x-2 mb-4">
            <div className="flex-1">
              <Form2.Item
                name={item.name}
                label={item.label}
                required
              >
                <Input placeholder={`請輸入${item.label}`} />
              </Form2.Item>
            </div>
            {formItems.length > 1 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => removeFormItem(item.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-ghost btn-sm mb-4"
          onClick={addFormItem}
        >
          + 添加項目
        </button>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            提交動態表單
          </button>
        </div>
      </Form2>
    </div>
  );
}

// 複雜驗證示例
export function ComplexValidationExample() {
  const handleFinish = (values: any) => {
    console.log('複雜驗證表單提交值:', values);
  };

  // 自定義驗證器 - 檢查用戶名是否已存在
  const checkUsernameExists = async (username: any) => {
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));

    const existingUsernames = ['admin', 'user', 'test'];
    if (existingUsernames.includes(username.toLowerCase())) {
      return '用戶名已存在';
    }
    return '';
  };

  // 確認密碼驗證器
  const confirmPasswordValidator = async (value: any, allValues: any) => {
    if (value !== allValues.password) {
      return '兩次輸入的密碼不一致';
    }
    return '';
  };

  return (
    <div className="max-w-md mx-auto">
      <Form2 onFinish={handleFinish}>
        <Form2.Item
          name="username"
          label="用戶名稱"
          required
          rules={[
            { min: 3, message: '用戶名至少需要3個字符' },
            { validator: checkUsernameExists }
          ]}
        >
          <Input placeholder="請輸入用戶名稱" />
        </Form2.Item>

        <Form2.Item
          name="password"
          label="密碼"
          required
          rules={[
            { min: 6, message: '密碼至少需要6個字符' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: '密碼必須包含大小寫字母和數字'
            }
          ]}
        >
          <Input type="password" placeholder="請輸入密碼" />
        </Form2.Item>

        <Form2.Item
          name="confirmPassword"
          label="確認密碼"
          required
          rules={[
            { validator: confirmPasswordValidator }
          ]}
        >
          <Input type="password" placeholder="請再次輸入密碼" />
        </Form2.Item>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            註冊
          </button>
        </div>
      </Form2>
    </div>
  );
}

// 網格佈局示例
export function GridLayoutExample() {
  const handleFinish = (values: any) => {
    console.log('網格佈局表單提交值:', values);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form2 onFinish={handleFinish} className="form-grid form-grid-cols-2">
        <Form2.Item name="firstName" label="姓" required>
          <Input placeholder="請輸入姓" />
        </Form2.Item>

        <Form2.Item name="lastName" label="名" required>
          <Input placeholder="請輸入名" />
        </Form2.Item>

        <Form2.Item name="email" label="電子郵件" required>
          <Input type="email" placeholder="請輸入電子郵件" />
        </Form2.Item>

        <Form2.Item name="phone" label="電話號碼">
          <Input placeholder="請輸入電話號碼" />
        </Form2.Item>

        <Form2.Item name="country" label="國家" required>
          <Select
            placeholder="請選擇國家"
            options={[
              { label: '台灣', value: 'tw' },
              { label: '中國', value: 'cn' },
              { label: '美國', value: 'us' },
              { label: '日本', value: 'jp' }
            ]}
          />
        </Form2.Item>

        <Form2.Item name="city" label="城市">
          <Input placeholder="請輸入城市" />
        </Form2.Item>

        <div className="col-span-1 md:col-span-2">
          <Form2.Item name="address" label="詳細地址">
            <TextArea placeholder="請輸入詳細地址" rows={3} />
          </Form2.Item>
        </div>

        <div className="col-span-1 md:col-span-2 form-actions">
          <button type="button" className="btn btn-ghost">
            重置
          </button>
          <button type="submit" className="btn btn-primary">
            保存
          </button>
        </div>
      </Form2>
    </div>
  );
}
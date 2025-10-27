"use client";

import React, { useState } from 'react';
import { FaMinus, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { Form2, FormValues } from '@/components/form2';
import Input from '@/components/form2/controls/Input';
import NumberInput from '@/components/form2/controls/NumberInput';
import TextArea from '@/components/form2/controls/TextArea';

interface CustomMealFormProps {
  isOpen: boolean;
  initialValues?: {
    name: string;
    price: number;
    quantity: number;
    note: string;
    description: string;
  };
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    price: number;
    quantity: number;
    note: string;
    description?: string;
  }) => void;
}

export default function CustomMealForm({
  isOpen,
  initialValues = {
    name: '',
    price: 0,
    quantity: 1,
    note: '',
    description: ''
  },
  onClose,
  onSubmit
}: CustomMealFormProps) {
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(0);

  const handleFinish = (values: FormValues) => {
    onSubmit({
      name: values.name as string,
      price: values.price as number,
      quantity: values.quantity as number,
      note: values.note as string,
      description: values.description as string,
    });
  };

  const calculateSubtotal = () => {
    return currentPrice * currentQuantity;
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        <Form2
          onFinish={handleFinish}
          initialValues={initialValues}
        >
          {/* 表單標題 */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">自訂餐點</h3>
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm"
              onClick={onClose}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* 餐點名稱 */}
          <Form2.Item
            name="name"
            label="餐點名稱"
            required
            rules={[
              { required: true, message: '請輸入餐點名稱' },
              { min: 1, message: '餐點名稱至少需要 1 個字符' },
              { max: 50, message: '餐點名稱最多 50 個字符' }
            ]}
          >
            <Input placeholder="例：牛肉麵" />
          </Form2.Item>

          {/* 價格 */}
          <Form2.Item
            name="price"
            label="價格"
            required
            rules={[
              { required: true, message: '請輸入價格' },
              { min: 1, message: '價格必須大於 0' }
            ]}
          >
            <NumberInput
              min={0}
              precision={0}
              step={1}
              placeholder="0"
            />
          </Form2.Item>

          {/* 餐點說明 */}
          <Form2.Item
            name="description"
            label="餐點說明"
            rules={[
              { max: 200, message: '說明最多 200 個字符' }
            ]}
          >
            <TextArea
              placeholder="可選：餐點說明"
              rows={2}
            />
          </Form2.Item>

          {/* 數量設定 */}
          <Form2.Item
            name="quantity"
            label="數量"
            required
            rules={[
              { required: true, message: '請輸入數量' },
              { min: 1, message: '數量必須大於 0' }
            ]}
          >
            <NumberInput
              min={1}
              precision={0}
              placeholder="1"
              className="text-center w-20"
            />
          </Form2.Item>

          {/* 餐點備註 */}
          <Form2.Item name="note" label="餐點備註">
            <Input placeholder="例：不要辣、加蛋、去冰..." />
          </Form2.Item>

          {/* 小計顯示 */}
          <div className="bg-primary/10 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span>小計：</span>
              <span className="font-bold text-primary">
                ${calculateSubtotal()}
              </span>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <FaCheck className="w-4 h-4 mr-2" />
              加入訂單
            </button>
          </div>
        </Form2>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

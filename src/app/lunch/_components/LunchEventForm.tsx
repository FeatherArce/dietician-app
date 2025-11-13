'use client';
import { Checkbox, Form2, Form2Props, Input, Select } from '@/components/form2';
import { Form2Ref } from '@/components/form2/types';
import { Shop } from '@/prisma-generated/postgres-client';
import { getLunchShops } from '@/services/client/lunch/lunch-shop';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState, useTransition } from 'react'
import { FaSave, FaSpinner } from 'react-icons/fa';

interface LunchEventFormProps extends Partial<Form2Props> {
  loading?: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

/**
 * 將 "YYYY-MM-DDTHH:mm" 轉換為 Date 物件
 */
export function parseDatetimeLocalString(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [datePart, timePart] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function convertIsoToDateTimeLocalString(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function LunchEventForm({
  loading = false,
  initialValues,
  submitButtonText = "儲存",
  onFinish,
  onCancel,
  ...props
}: LunchEventFormProps) {

  const router = useRouter();
  const formRef = React.useRef<Form2Ref>(null);
  const [isPending, startTransition] = useTransition();
  const [shops, setShops] = useState<Shop[]>([]);

  const getShops = useCallback(async () => {
    try {
      const { result } = await getLunchShops({ isActive: true });
      if (result.success && result.data?.shops) {
        setShops(result.data?.shops);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    }
  }, []);

  // 獲取商店列表
  useEffect(() => {
    startTransition(() => {
      getShops();
    });
  }, [getShops]);

  useEffect(() => {
    if (initialValues) {
      const orderDeadline = initialValues.order_deadline as string | undefined;
      const newValues = {
        ...initialValues,
        order_deadline: orderDeadline ? convertIsoToDateTimeLocalString(orderDeadline) : '',
      }
      formRef.current?.setFieldsValue(newValues);
    } else {
      formRef.current?.reset();
    }
  }, [initialValues]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  }, [onCancel, router]);

  return (
    <Form2
      ref={formRef}
      initialValues={initialValues}
      onFinish={onFinish}
      {...props}
    >
      <Form2.Item
        label="活動名稱"
        name="title"
        rules={[
          { required: true, message: '活動名稱為必填' },
        ]}
      >
        <Input name="title" placeholder="例如：明日午餐訂餐" />
      </Form2.Item>
      <Form2.Item
        label="訂餐截止時間"
        name="order_deadline"
        rules={[
          { required: true, message: '訂餐截止時間為必填' },
          {
            validator: async (value) => {
              if (value) {
                const selectedDate = parseDatetimeLocalString(String(value));
                const now = new Date();
                if (selectedDate <= now) {
                  return '訂餐截止時間必須在未來';
                }
              }
              return '';
            }
          }
        ]
        }
      >
        <Input type="datetime-local" name="order_deadline" />
      </Form2.Item>
      <Form2.Item
        label="活動描述"
        name="description"
      >
        <Input name="description" placeholder="歡迎大家一起訂餐！" />
      </Form2.Item>
      <Form2.Item
        label="取餐地點"
        name="location"
      >
        <Input name="location" placeholder="例如：公司1樓大廳" />
      </Form2.Item>
      <Form2.Item
        label="商店"
        name="shop_id"
      >
        <Select
          placeholder="選擇商店"
          disabled={isPending}
          options={((shops || []).map(shop => ({ value: shop.id, label: shop.address ? `${shop.name} (${shop.address})` : shop.name })))}
        />
      </Form2.Item>
      <Form2.Item
        label="允許自訂餐點"
        name="allow_custom_items"
        valuePropName="checked"
      >
        <Checkbox
          label="允許參與者新增菜單以外的餐點"
        />
      </Form2.Item>

      {/* 操作按鈕 */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleCancel}
          className="btn btn-ghost"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? (
            <FaSpinner className="w-4 h-4 animate-spin" />
          ) : (
            <FaSave className="w-4 h-4" />
          )}
          {submitButtonText}
        </button>
      </div>
    </Form2>
  )
}

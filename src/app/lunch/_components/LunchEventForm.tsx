'use client';
import { Checkbox, Form, FormProps, Input, Select } from '@/components/form';
import { FormRef } from '@/components/form/types';
import { LoadingSkeleton } from '@/components/ui/Loading';
import { Shop } from '@/prisma-generated/postgres-client';
import { getLunchShops } from '@/data-access/lunch/lunch-shop';
import moment from 'moment-timezone';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState, useTransition } from 'react'
import { FaSave, FaSpinner } from 'react-icons/fa';

interface LunchEventFormProps extends Partial<FormProps> {
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
  const datatimeLocal = moment(dateString).tz('Asia/Taipei').format('YYYY-MM-DDTHH:mm');
  return datatimeLocal;
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
  const formRef = React.useRef<FormRef>(null);
  const [isPending, startTransition] = useTransition();
  const [shops, setShops] = useState<Shop[]>([]);

  const getShops = useCallback(async () => {
    startTransition(async () => {
      try {
        const { result } = await getLunchShops({ isActive: true });
        if (result.success && result.data?.shops) {
          setShops(result.data?.shops);
        }
      } catch (error) {
        console.error('Failed to fetch shops:', error);
      }
    });
  }, []);

  // 獲取商店列表
  useEffect(() => {
    getShops();
  }, [getShops]);

  const formatedInitialValues = React.useMemo(() => {
    if (initialValues) {
      const orderDeadline = initialValues.order_deadline as string | undefined;
      console.log('Initial order_deadline:', orderDeadline);
      const dateTimeLocal = orderDeadline ? convertIsoToDateTimeLocalString(orderDeadline) : '';
      console.log('Converted order_deadline to datetime-local:', dateTimeLocal);
      const newValues = {
        title: initialValues.title,
        description: initialValues.description,
        location: initialValues.location,
        shop_id: initialValues.shop_id,
        allow_custom_items: initialValues.allow_custom_items,
        order_deadline: dateTimeLocal,
      };
      return newValues;
    }
    return undefined;
  }, [initialValues]);

  // useEffect(() => {
  //   if (initialValues) {
  //     const orderDeadline = initialValues.order_deadline as string | undefined;
  //     console.log('Initial order_deadline:', orderDeadline);
  //     const dateTimeLocal = orderDeadline ? convertIsoToDateTimeLocalString(orderDeadline) : '';
  //     console.log('Converted order_deadline to datetime-local:', dateTimeLocal);
  //     const newValues = {
  //       ...initialValues,
  //       order_deadline: dateTimeLocal,
  //     };
  //     formRef.current?.setFieldsValue(newValues);
  //   } else {
  //     formRef.current?.reset();
  //   }
  // }, [initialValues]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  }, [onCancel, router]);

  if (isPending) {
    return (<LoadingSkeleton height="20rem" />);
  }

  return (
    <Form
      ref={formRef}
      initialValues={formatedInitialValues}
      onFinish={onFinish}
      {...props}
    >
      <Form.Item
        label="活動名稱"
        name="title"
        rules={[
          { required: true, message: '活動名稱為必填' },
        ]}
      >
        <Input name="title" placeholder="例如：明日午餐訂餐" />
      </Form.Item>
      <Form.Item
        label="訂餐截止時間"
        name="order_deadline"
        rules={[
          { required: true, message: '訂餐截止時間為必填' },
          // {
          //   validator: async (value) => {
          //     if (value) {
          //       const selectedDate = parseDatetimeLocalString(String(value));
          //       const now = new Date();
          //       if (selectedDate <= now) {
          //         return '訂餐截止時間必須在未來';
          //       }
          //     }
          //     return '';
          //   }
          // }
        ]
        }
      >
        <Input type="datetime-local" />
      </Form.Item>
      <Form.Item
        label="活動描述"
        name="description"
      >
        <Input name="description" placeholder="歡迎大家一起訂餐！" />
      </Form.Item>
      <Form.Item
        label="取餐地點"
        name="location"
      >
        <Input name="location" placeholder="例如：公司1樓大廳" />
      </Form.Item>
      <Form.Item
        label="商店"
        name="shop_id"
      >
        <Select
          placeholder="選擇商店"
          disabled={isPending}
          options={((shops || []).map(shop => ({ value: shop.id, label: shop.address ? `${shop.name} (${shop.address})` : shop.name })))}
        />
      </Form.Item>
      <Form.Item
        label="允許自訂餐點"
        name="allow_custom_items"
        valuePropName="checked"
      >
        <Checkbox
          label="允許參與者新增菜單以外的餐點"
        />
      </Form.Item>

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
    </Form>
  )
}

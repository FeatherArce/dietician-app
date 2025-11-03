"use client";
import { Form2, FormValues } from '@/components/form2';
import Input from '@/components/form2/controls/Input';
import NumberInput from '@/components/form2/controls/NumberInput';
import TextArea from '@/components/form2/controls/TextArea';
import { Form2Ref } from '@/components/form2/types';
import React, { useCallback, useImperativeHandle, useMemo } from 'react';

export enum MealFormMode {
  ADD = 'add',
  EDIT = 'edit',
}

export interface MenuFormValues {
  name: string;
  price: number;
  quantity: number;
  note: string;
  description?: string;
  menu_item_id?: string;
  [x: string]: unknown;
}

interface CustomMealFormProps {
  mode: MealFormMode;
  initialValues?: MenuFormValues;
  onSubmit: (values: MenuFormValues) => void;
}

function MealForm({
  mode = MealFormMode.ADD,
  initialValues,
  onSubmit
}: CustomMealFormProps,
  ref: React.Ref<any>
) {
  const formRef = React.useRef<Form2Ref>(null);

  useImperativeHandle(ref, () => ({
    submit: () => {
      formRef.current?.submit();
    },
    reset: () => {
      formRef.current?.reset();
    },
    setFieldsValue: (values: Partial<FormValues>) => {
      formRef.current?.setFieldsValue(values);
    },
  }));

  const isFromMenu = useMemo(() => {
    return !!initialValues?.menu_item_id;
  }, [initialValues]);


  // TODO: 待優化，目前已知會引發錯誤: 
  // const [currentQuantity, setCurrentQuantity] = useState(1);
  // const [currentPrice, setCurrentPrice] = useState(0);
  // MealForm.tsx: Cannot update a component (ForwardRef(MealForm)) while rendering a different component (ForwardRef(Form2)). To locate the bad setState() call inside ForwardRef(Form2), follow the stack trace as described in https://react.dev/link/setstate-in-render
  // const subtotal = useMemo(() => {
  //   return currentPrice * currentQuantity;
  // }, [currentPrice, currentQuantity]);
  // const handleValuesChange = useCallback((changedValues: FormValues, allValues: FormValues) => {
  //   if (typeof changedValues.price === 'number') {
  //     setCurrentPrice(changedValues.price);
  //   }
  //   if (typeof changedValues.quantity === 'number') {
  //     setCurrentQuantity(changedValues.quantity);
  //   }
  // }, []);

  const handleFinish = useCallback((values: FormValues) => {
    onSubmit(values as MenuFormValues);
  }, [onSubmit]);

  const setNote = useCallback((note: string) => {
    formRef.current?.setFieldsValue({ note });
  }, []);

  return (
    <Form2
      ref={formRef}
      onFinish={handleFinish}
      initialValues={initialValues}
    // onValuesChange={(changedValues, allValues) => {
    //   setFormValues(allValues);
    // }}
    >
      {/* 餐點名稱 */}
      <Form2.Item
        name="name"
        label="餐點名稱"
        required
        rules={[
          { required: true, message: '請輸入餐點名稱' },
        ]}
        help={initialValues?.description}
      >
        <Input placeholder="例：牛肉麵" disabled={isFromMenu} />
      </Form2.Item>

      {/* 餐點說明 */}
      {/* <Form2.Item
        name="description"
        label="餐點說明"
      >
        <TextArea
          placeholder="可選：餐點說明"
          rows={2}
          disabled={isFromMenu}
        />
      </Form2.Item> */}

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
          placeholder="請輸入價格"
          disabled={isFromMenu}
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
          placeholder="請輸入數量"
        />
      </Form2.Item>

      {/* 餐點備註 */}
      <Form2.Item
        name="note"
        label="餐點備註"
        help={<div className='flex'>
          <button type='button' className='btn btn-xs btn-ghost' onClick={() => { setNote('半飯') }}>半飯</button>
          <button type='button' className='btn btn-xs btn-ghost' onClick={() => { setNote('飯換菜') }}>飯換菜</button>
        </div>}
      >
        <Input placeholder="例：不要辣、加蛋、去冰..." />
      </Form2.Item>

      {/* 小計顯示 */}
      {/* <div className="bg-primary/10 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span>小計：</span>
          <span className="font-bold text-primary">
            ${subtotal}
          </span>
        </div>
      </div> */}

      {/* 操作按鈕 */}
      {/* <div className="modal-action">
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
      </div> */}
    </Form2>
  );
}

export default React.forwardRef(MealForm);
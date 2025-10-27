"use client";
import React, { useState } from 'react';
import { FaMinus, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { Form2, FormValues } from '@/components/form2';
import Input from '@/components/form2/controls/Input';
import NumberInput from '@/components/form2/controls/NumberInput';

interface MenuItemData {
    id?: string;
    name: string;
    description?: string;
    price: number;
}

interface MenuMealFormProps {
    menuItem: MenuItemData;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        price: number;
        quantity: number;
        note: string;
        description?: string;
        menu_item_id?: string;
    }) => void;
}

export default function MenuMealForm({ menuItem, isOpen, onClose, onSubmit }: MenuMealFormProps) {
    const [currentQuantity, setCurrentQuantity] = useState(1);

    const handleFinish = (values: FormValues) => {
        console.log('Submitting menu meal form with values:', values);
        console.log('Values types:', Object.entries(values).map(([key, value]) => [key, typeof value, value]));
        onSubmit({
            name: menuItem.name,
            price: menuItem.price,
            quantity: values.quantity as number,
            note: values.note as string,
            description: menuItem.description,
            menu_item_id: menuItem.id,
        });
    };

    const calculateSubtotal = (quantity: number) => {
        return menuItem.price * quantity;
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-md">
                {/* 表單標題 */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">點餐</h3>
                    <button
                        type="button"
                        className="btn btn-ghost btn-circle btn-sm"
                        onClick={onClose}
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>

                {/* 菜單餐點資訊 */}
                <div className="mb-4">
                    <h4 className="block text-sm font-medium text-base-content mb-1">餐點名稱</h4>
                    <p>{menuItem.name}</p>
                </div>

                {menuItem.description && (
                    <div className="mb-4">
                        <h4 className="block text-sm font-medium text-base-content mb-1">說明</h4>
                        <p>{menuItem.description}</p>
                    </div>
                )}

                <div className="mb-4">
                    <h4 className="block text-sm font-medium text-base-content mb-1">單價</h4>
                    <p>${menuItem.price}</p>
                </div>

                <Form2
                    onFinish={handleFinish}
                    initialValues={{
                        quantity: 1,
                        note: ''
                    }}
                >
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
                                ${calculateSubtotal(currentQuantity)}
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

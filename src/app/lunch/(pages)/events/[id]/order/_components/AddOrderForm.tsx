import { Form2, Input, NumberInput } from '@/components/form2'
import React, { useCallback } from 'react'

export default function AddOrderForm() {
    const handleFinish = useCallback(async (values: any) => {
        console.log('Form submitted with values:', values);
    }, []);

    return (
        <div>
            <Form2 onFinish={handleFinish}>
                <Form2.List name="items">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, fieldKey }, index) => (
                                <div key={key} className="border border-base-300 rounded-lg p-4 mb-4 bg-base-50 grid grid-cols-[1fr_auto] gap-4">
                                    <div className="grid grid-cols-4 gap-4">
                                        <Form2.Item name={[name, 'name']} required={true}>
                                            <Input placeholder='餐點名稱' />
                                        </Form2.Item>
                                        <Form2.Item name={[name, 'quantity']} required={true}>
                                            <NumberInput placeholder='數量' />
                                        </Form2.Item>
                                        <Form2.Item name={[name, 'price']} required={true}>
                                            <NumberInput placeholder='價格' />
                                        </Form2.Item>
                                        <Form2.Item name={[name, 'note']}>
                                            <Input placeholder='備註' />
                                        </Form2.Item>
                                    </div>
                                    <div className="flex justify-end items-center mb-4">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-error"
                                            onClick={() => remove(name)}
                                        >
                                            刪除
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                className="btn btn-secondary btn-outline w-full"
                                onClick={() => add({ name: '', quantity: 1, price: 0, note: '' })}
                            >
                                + 新增餐點
                            </button>
                        </>
                    )}
                </Form2.List>
            </Form2>
        </div>
    )
}

import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import { Checkbox, Form2, Form2Props, Input, NumberInput, TextArea } from '../form2'
import { FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Form2Ref } from '../form2/types';

interface MenuItemFormProps extends Partial<Form2Props> {
    loading?: boolean;
    mode?: 'create' | 'edit';
    onCancel?: () => void;
}

function MenuItemForm({
    initialValues,
    loading = false,
    mode = 'edit',
    onFinish,
    onFinishFailed,
    onCancel,
    onValuesChange,
    ...props
}: MenuItemFormProps, ref: React.Ref<any>) {
    const formRef = useRef<Form2Ref>(null);

    useImperativeHandle(ref, () => ({
        setFieldsValue: (values: Partial<any>) => {
            formRef.current?.setFieldsValue(values);
        },
        reset: () => {
            formRef.current?.reset();
        }
    }), []);

    return (
        <Form2
            ref={formRef}
            initialValues={initialValues}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            onValuesChange={onValuesChange}
            {...props}
        >
            {/* <Form2.Item name='category_id' label='項目分類'></Form2.Item> */}
            {/* <Form2.Item name='sort_order' label='排序順序'>
                <NumberInput placeholder='請輸入排序順序' />
            </Form2.Item> */}
            <Form2.Item
                name='name'
                label='項目名稱'
                rules={[
                    { required: true, }
                ]}
            >
                <Input placeholder='請輸入項目名稱' />
            </Form2.Item>
            <Form2.Item
                name='price'
                label='價格'
                rules={[
                    { required: true, }
                ]}
            >
                <NumberInput placeholder='請輸入價格' />
            </Form2.Item>
            <Form2.Item name='description' label='項目描述'>
                <TextArea placeholder='請輸入項目描述' rows={4} />
            </Form2.Item>
            <Form2.Item name='is_available' label='是否可用' valuePropName='checked'>
                <Checkbox />
            </Form2.Item>
            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-ghost"
                    disabled={loading}
                >
                    取消
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? (
                        <>
                            <span className="loading loading-spinner loading-sm mr-2"></span>
                            更新中...
                        </>
                    ) : (
                        <>
                            <FaEdit className="w-4 h-4 mr-2" />
                            {mode === 'create' ? '新增項目' : '更新項目'}
                        </>
                    )}
                </button>
            </div>
        </Form2>
    )
}

export default forwardRef(MenuItemForm);
import { Form2, Input } from '@/components/form2'
import { Form2Ref, FormValues } from '@/components/form2/types';
import { toast } from '@/components/Toast';
import { UpdateUser } from '@/services/client/user';
import React, { useCallback } from 'react'

export default function UserForm({ }) {
    const formRef = React.useRef<Form2Ref>(null);

    const handleSubmit = useCallback(async (values: FormValues) => {
        try {
            const name = values.name as string;
            const res = await UpdateUser('current', { name });
            if (res.response.ok) {
                toast.success('使用者資料更新成功');
            } else {
                toast.error(`使用者資料更新失敗: ${res.result.error || '未知錯誤'}`);
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('使用者資料更新失敗');
        }
    }, []);

    return (
        <Form2
            ref={formRef}
            onFinish={handleSubmit}
        >
            <Form2.Item label="電子郵件" name="email" required>
                <Input type="email" placeholder="請輸入電子郵件" disabled />
            </Form2.Item>
            <Form2.Item label="使用者名稱" name="name" required>
                <Input placeholder="請輸入使用者名稱" />
            </Form2.Item>
            <Form2.Button.Container>
                <Form2.Button type='submit'>
                    儲存
                </Form2.Button>
            </Form2.Button.Container>
        </Form2 >
    )
}

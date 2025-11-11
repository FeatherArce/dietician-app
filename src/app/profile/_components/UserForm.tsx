import { Form2, Input } from '@/components/form2'
import { Form2Ref, FormValues } from '@/components/form2/types';
import { toast } from '@/components/Toast';
import { updateUser } from '@/services/client/user';
import type { User } from 'next-auth';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react'

interface UserFormProps {
    user?: User;
}

function UserForm({ user }: UserFormProps, ref: React.Ref<Form2Ref>) {
    const [loading, setLoading] = React.useState(false);
    const formRef = React.useRef<Form2Ref>(null);

    const initialValues = useMemo(() => {
        return {
            email: user?.email || '',
            name: user?.name || '',
        };
    }, [user]);

    const handleSubmit = useCallback(async (values: FormValues) => {
        if (!user?.id) {
            toast.error('使用者未登入，無法更新資料');
            return;
        }

        setLoading(true);
        try {
            const name = values.name as string;
            const res = await updateUser(user.id, { name });
            if (res.response.ok) {
                toast.success('使用者資料更新成功');
            } else {
                toast.error(`使用者資料更新失敗: ${res.result.error || '未知錯誤'}`);
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('使用者資料更新失敗');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useImperativeHandle(ref, () => ({
        submit: () => {
            formRef.current?.submit();
        },
        reset: () => {
            formRef.current?.reset();
        },
        setFieldValue: (name: string | (string | number)[], value: unknown) => {
            formRef.current?.setFieldValue(name, value);
        },
        setFieldsValue: (values: FormValues) => {
            formRef.current?.setFieldsValue(values);
        },
    }), []);

    return (
        <Form2
            ref={formRef}
            initialValues={initialValues}
            onFinish={handleSubmit}
        >
            <Form2.Item label="電子郵件" name="email" required>
                <Input type="email" placeholder="請輸入電子郵件" disabled />
            </Form2.Item>
            <Form2.Item label="使用者名稱" name="name" required>
                <Input placeholder="請輸入使用者名稱" />
            </Form2.Item>
            <Form2.Button.Container>
                <Form2.Button type='submit' loading={loading}>
                    儲存
                </Form2.Button>
            </Form2.Button.Container>
        </Form2 >
    )
}

export default forwardRef(UserForm);
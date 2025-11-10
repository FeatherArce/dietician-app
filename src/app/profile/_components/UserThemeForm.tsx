import { Form2, Input, Select } from '@/components/form2'
import { Form2Ref, FormValues } from '@/components/form2/types';
import { toast } from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { User } from '@/prisma-generated/postgres-client';
import { updateUser } from '@/services/client/user';
import type { PublicUser } from '@/types/User';
import { useSession } from "next-auth/react";
import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react'

// 可用主題列表
export const availableThemes = [
    { value: "light", label: "淺色" },
    { value: "dark", label: "深色" },
    { value: "cupcake", label: "杯子蛋糕" },
    { value: "bumblebee", label: "大黃蜂" },
    { value: "emerald", label: "翡翠" },
    { value: "corporate", label: "企業" },
    { value: "synthwave", label: "合成波" },
    { value: "retro", label: "復古" },
    { value: "cyberpunk", label: "賽博朋克" },
    { value: "valentine", label: "情人節" },
    { value: "halloween", label: "萬聖節" },
    { value: "garden", label: "花園" },
    { value: "forest", label: "森林" },
    { value: "aqua", label: "水藍" },
    { value: "lofi", label: "低保真" },
    { value: "pastel", label: "粉彩" },
    { value: "fantasy", label: "幻想" },
    { value: "wireframe", label: "線框" },
    { value: "luxury", label: "奢華" },
    { value: "dracula", label: "德古拉" },
    { value: "cmyk", label: "CMYK" }
];

interface UserFormProps {
    user?: Partial<PublicUser> | null;
}

function UserThemeForm({ user }: UserFormProps, ref: React.Ref<Form2Ref>) {
    const { setTheme } = useTheme();
    const [loading, setLoading] = React.useState(false);
    const formRef = React.useRef<Form2Ref>(null);

    const initialValues = useMemo(() => {
        const defaultTheme = document.documentElement.getAttribute("data-theme") || 'light';
        return {
            preferred_theme: user?.preferred_theme || defaultTheme,
        };
    }, [user]);

    const handleValuesChange = useCallback((changedValues: FormValues, allValues: FormValues) => {
        if (changedValues.preferred_theme) {
            const newTheme = changedValues.preferred_theme as string;
            setTheme(newTheme);
            document.documentElement.setAttribute("data-theme", newTheme);
        }
    }, [setTheme]);

    const handleSubmit = useCallback(async (values: FormValues) => {
        if (!user?.id) {
            toast.error('使用者未登入，無法更新資料');
            return;
        }

        setLoading(true);
        try {
            const preferred_theme = values.preferred_theme as string;
            const res = await updateUser(user?.id, { preferred_theme });
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
    }));

    return (
        <Form2
            ref={formRef}
            initialValues={initialValues}
            onFinish={handleSubmit}
            onValuesChange={handleValuesChange}
        >
            <Form2.Item label="主題" name="preferred_theme" required>
                <Select placeholder="請選擇主題" options={availableThemes} />
            </Form2.Item>
            <Form2.Button.Container>
                <Form2.Button type='submit' loading={loading}>
                    儲存
                </Form2.Button>
            </Form2.Button.Container>
        </Form2 >
    )
}

export default forwardRef(UserThemeForm);
import { Form, FormProps, FormItem, Input } from '@/components/form'
import React from 'react'

interface RegisterFormProps extends FormProps {
    isLoading?: boolean;
    submitText?: string;
}

export default function RegisterForm({
    isLoading = false,
    submitText = "註冊",
    ...props
}: Partial<RegisterFormProps>) {
    return (
        <Form
            autoComplete="off"
            {...props}
        >
            <Form.Item
                name='email'
                label='電子信箱'
                rules={[
                    {
                        required: true,
                        validator: (value) => {
                            if (!value) {
                                return '請輸入電子信箱';
                            }
                            if (!/\S+@\S+\.\S+/.test(value as string)) {
                                return '請輸入有效的電子信箱';
                            }
                            return '';
                        }
                    }
                ]}
            >
                <Input type='email' placeholder='請輸入電子信箱' autoComplete='email' />
            </Form.Item>
            <Form.Item
                name='name'
                label='使用者名稱'
                rules={[
                    { required: true, message: '請輸入使用者名稱' },
                    { min: 2, message: '使用者名稱至少需要 2 個字符' },
                    { max: 30, message: '使用者名稱最多 30 個字符' }
                ]}
            >
                <Input type='text' placeholder='請輸入使用者名稱' autoComplete='new-user-name' />
            </Form.Item>
            <Form.Item
                name='password'
                label='密碼'
                rules={[
                    {
                        required: true,
                        message: '請輸入密碼'
                    },
                    {
                        min: 8,
                        message: '密碼至少需要 8 個字符'
                    },
                    {
                        max: 100,
                        message: '密碼最多 100 個字符'
                    }
                ]}
            >
                <Input type='password' placeholder='請輸入密碼' autoComplete='new-password' />
            </Form.Item>
            <Form.Item
                name='confirmPassword'
                label='確認密碼'
                rules={[
                    {
                        required: true,
                        message: '請再次輸入密碼'
                    },
                    {
                        validator: (value, allValues) => {
                            if (value !== allValues.password) {
                                return '兩次輸入的密碼不一致';
                            }
                            return '';
                        }
                    }
                ]}
            >
                <Input type='password' placeholder='請再次輸入密碼' autoComplete='user-password' />
            </Form.Item>
            <div className="form-control mt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`btn btn-primary w-full`}
                >
                    {isLoading && <span className="loading loading-spinner loading-xs"></span>}
                    {isLoading ? "處理中..." : submitText}
                </button>
            </div>
        </Form>
    )
}

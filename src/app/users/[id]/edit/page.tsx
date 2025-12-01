"use client";
import Breadcrumb, { usersBreadcrumbHomeItem } from '@/components/Breadcrumb';
import { Checkbox, Form, Input, Select } from '@/components/form';
import { FormRef, FormValues } from '@/components/form/types';
import PageTitle from '@/components/page/PageTitle';
import { toast } from '@/components/Toast';
import { UserRole } from '@/prisma-generated/postgres-client';
import { updateUser } from '@/data-access/user';
import { getUserRoleChineseName } from '@/types/User';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaSave } from 'react-icons/fa';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  is_active: boolean;
}

interface FormData {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
  general?: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = useMemo(() => {
    return params?.id || null;
  }, [params]);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormValues>({
    name: '',
    email: '',
    role: 'USER',
    is_active: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const formRef = useRef<FormRef>(null);

  const roleOptions = useMemo(() => ([
    { label: getUserRoleChineseName(UserRole.USER), value: 'USER' },
    { label: getUserRoleChineseName(UserRole.MODERATOR), value: 'MODERATOR' },
    { label: getUserRoleChineseName(UserRole.ADMIN), value: 'ADMIN' },
  ]), []);

  // 取得使用者資料
  const getUser = useCallback(async () => {
    if (!userId) return;
    if (typeof userId !== 'string') {
      setErrors({ general: '無效的使用者ID' });
      setInitialLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        setUserData(user);
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.is_active
        });
      } else {
        throw new Error('使用者不存在');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setErrors({ general: '載入使用者資料失敗' });
    } finally {
      setInitialLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const handleFinish = useCallback(async (values: FormValues) => {
    if (!userId) return;

    setLoading(true);
    setErrors({});

    // let action = 'update';
    // if (values.password && String(values.password).trim() !== '') {
    //   action = 'force_reset_password';
    // }

    try {
      const uid = userId as string;
      const res = await updateUser(uid, { ...values });
      const { response, result } = res;
      if (response.ok && result.success) {
        console.log('User updated successfully');
        toast.success('使用者更新成功');
        // 使用瀏覽器返回上一頁，而不是強制跳轉到詳情頁面
        router.back();
      } else {
        throw new Error(result.error || '更新使用者失敗');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      setErrors({
        general: error instanceof Error ? error.message : '更新使用者失敗'
      });
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">找不到使用者</h2>
          <button
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            返回上一頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          usersBreadcrumbHomeItem,
          { label: '使用者管理', href: '/users' },
          { label: userData.name, href: `/users/${userId}` },
          { label: '編輯', current: true }
        ]}
      />

      {/* 頁面標題 */}
      <PageTitle
        title="編輯使用者"
        size="xl"
        description="修改使用者資料和權限設定"
      />

      {/* 表單 */}
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <Form ref={formRef} initialValues={formData} onFinish={handleFinish}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '請輸入姓名' }]}>
                <Input placeholder="請輸入姓名" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: '請輸入 Email' }, { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '請輸入有效的 Email 地址' }]}
              >
                <Input type="email" placeholder="請輸入 Email 地址" />
              </Form.Item>
              <Form.Item name="role" label="角色" rules={[{ required: true, message: '請選擇角色' }]}>
                <Select
                  options={roleOptions}
                  placeholder="請選擇角色"
                />
              </Form.Item>
              {/* <Form.Item name="password" label="重設密碼" help="如需重設密碼，請在此輸入新密碼，否則留空">
                <Input type="password" placeholder="輸入新密碼以重設" />
              </Form.Item> */}
              <Form.Item name="is_active" label="帳戶狀態" valuePropName="checked">
                <Checkbox label='是否啟用帳戶，勾選為啟用' />
              </Form.Item>
              <Form.Button.Container>
                <Form.Button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  <FaSave className="h-4 w-4" />
                  更新使用者
                </Form.Button>
              </Form.Button.Container>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
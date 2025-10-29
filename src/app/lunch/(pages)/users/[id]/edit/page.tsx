"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaUser, FaEnvelope, FaUserTag, FaArrowLeft, FaSave } from 'react-icons/fa';
import Breadcrumb from '@/components/Breadcrumb';
import { getUserRoleLabel } from '@/types/User';
import { UserRole } from '@/prisma-generated/postgres-client';

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
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'USER',
    is_active: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 取得用戶資料
  const getUsers = useCallback(async () => {
    if (!userId) return;
    if (typeof userId !== 'string') {
      setErrors({ general: '無效的用戶ID' });
      setInitialLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/lunch/users/${userId}`);
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
        throw new Error('用戶不存在');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setErrors({ general: '載入用戶資料失敗' });
    } finally {
      setInitialLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // 驗證姓名
    if (!formData.name.trim()) {
      newErrors.name = '請輸入姓名';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '姓名至少需要 2 個字符';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = '姓名不能超過 50 個字符';
    }

    // 驗證 Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '請輸入 Email';
    } else if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = '請輸入有效的 Email 地址';
    }

    // 驗證角色
    if (!['USER', 'ADMIN', 'MODERATOR'].includes(formData.role)) {
      newErrors.role = '請選擇有效的角色';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/lunch/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          is_active: formData.is_active
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 使用瀏覽器返回上一頁，而不是強制跳轉到詳情頁面
        router.back();
      } else {
        throw new Error(data.error || '更新用戶失敗');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      setErrors({
        general: error instanceof Error ? error.message : '更新用戶失敗'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除相關錯誤
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
          <h2 className="text-2xl font-bold mb-4">找不到用戶</h2>
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
          { label: '使用者管理', href: '/lunch/users' },
          { label: userData.name, href: `/lunch/users/${userId}` },
          { label: '編輯', current: true }
        ]}
      />

      {/* 頁面標題 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            <FaArrowLeft className="h-4 w-4" />
            返回
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              編輯用戶
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              修改用戶資料和權限設定
            </p>
          </div>
        </div>
      </div>

      {/* 表單 */}
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 一般錯誤訊息 */}
              {errors.general && (
                <div className="alert alert-error">
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {/* 姓名 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaUser className="h-4 w-4" />
                      姓名 <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                    placeholder="請輸入姓名"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={loading}
                  />
                  {errors.name && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.name}</span>
                    </label>
                  )}
                </div>

                {/* Email */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaEnvelope className="h-4 w-4" />
                      Email <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                    placeholder="請輸入 Email 地址"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={loading}
                  />
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.email}</span>
                    </label>
                  )}
                </div>

                {/* 角色 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaUserTag className="h-4 w-4" />
                      角色 <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    className={`select select-bordered w-full ${errors.role ? 'select-error' : ''}`}
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value as FormData['role'])}
                    disabled={loading}
                  >
                    <option value="USER">{getUserRoleLabel(UserRole.USER)}</option>
                    <option value="MODERATOR">{getUserRoleLabel(UserRole.MODERATOR)}</option>
                    <option value="ADMIN">{getUserRoleLabel(UserRole.ADMIN)}</option>
                  </select>
                  {errors.role && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.role}</span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt">
                      一般用戶：基本權限 | 管理者：管理權限 | 系統管理員：完整權限
                    </span>
                  </label>
                </div>

                {/* 帳戶狀態 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">帳戶狀態</span>
                  </label>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        disabled={loading}
                      />
                      <span className="label-text">啟用帳戶</span>
                    </label>
                  </div>
                  <label className="label">
                    <span className="label-text-alt">
                      停用的帳戶將無法登入系統
                    </span>
                  </label>
                </div>
              </div>

              {/* 提交按鈕 */}
              <div className="form-control mt-8">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <FaSave className="h-4 w-4" />
                      更新用戶
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
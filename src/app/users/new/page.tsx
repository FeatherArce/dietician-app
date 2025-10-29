"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaArrowLeft, FaSave } from 'react-icons/fa';
import Breadcrumb from '@/components/Breadcrumb';
import { getUserRoleLabel } from '@/types/User';
import { UserRole } from '@/prisma-generated/postgres-client';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  general?: string;
}

export default function NewUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

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

    // 驗證密碼
    if (!formData.password) {
      newErrors.password = '請輸入密碼';
    } else if (formData.password.length < 8) {
      newErrors.password = '密碼至少需要 8 個字符';
    } else if (formData.password.length > 100) {
      newErrors.password = '密碼不能超過 100 個字符';
    }

    // 驗證確認密碼
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '請確認密碼';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼確認不一致';
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
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/users');
      } else {
        throw new Error(data.error || '創建用戶失敗');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      setErrors({
        general: error instanceof Error ? error.message : '創建用戶失敗'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除相關錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <Breadcrumb 
        items={[
          { label: '使用者管理', href: '/users' },
          { label: '新增用戶', current: true }
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
              新增用戶
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              創建新的系統用戶帳戶
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

                {/* 密碼 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaLock className="h-4 w-4" />
                      密碼 <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="password"
                    className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                    placeholder="請輸入密碼（至少 8 個字符）"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={loading}
                  />
                  {errors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.password}</span>
                    </label>
                  )}
                </div>

                {/* 確認密碼 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaLock className="h-4 w-4" />
                      確認密碼 <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="password"
                    className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="請再次輸入密碼"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.confirmPassword}</span>
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
                      創建用戶
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
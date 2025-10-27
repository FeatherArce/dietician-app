"use client";
import React from 'react';
import { FaEdit, FaStore } from 'react-icons/fa';
import { Form2, FormItem, Input, Checkbox, TextArea, Form2Props } from '../form2';
import { useRouter } from 'next/navigation';

export interface ShopFormData {
  [key: string]: any;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  is_active: boolean;
}

export interface ShopFormErrors {
  [key: string]: string;
}

interface ShopFormProps {
  formData: ShopFormData;
  errors: ShopFormErrors;
  onChange: (name: keyof ShopFormData, value: string | boolean) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * @deprecated Use FullShopForm instead
 * ShopForm - 可重用的商店表單組件
 * 
 * 適用於：
 * - 新增商店頁面
 * - 編輯商店頁面
 * - 任何需要商店資訊輸入的地方
 */
export function ShopForm({
  formData,
  errors,
  onChange,
  isLoading = false,
  className = ""
}: ShopFormProps) {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    onChange(name as keyof ShopFormData, type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 基本資訊 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">基本資訊</h2>

          <div className="grid grid-cols-1 gap-6">
            {/* 商店名稱 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">商店名稱 *</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="例如：王家麵店"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                required
                disabled={isLoading}
              />
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.name}</span>
                </label>
              )}
            </div>

            {/* 商店描述 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">商店描述</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="介紹商店特色、招牌菜等..."
                className="textarea textarea-bordered w-full"
                rows={3}
                disabled={isLoading}
              />
              {errors.description && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.description}</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 聯絡資訊 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">聯絡資訊</h2>

          <div className="grid grid-cols-1 gap-6">
            {/* 地址 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">地址</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="例如：台北市中正區羅斯福路一段"
                className={`input input-bordered w-full ${errors.address ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.address && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.address}</span>
                </label>
              )}
            </div>

            {/* 電話 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">電話</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="例如：02-1234-5678"
                className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.phone && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.phone}</span>
                </label>
              )}
            </div>

            {/* 電子郵件 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">電子郵件</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="例如：contact@restaurant.com"
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </div>

            {/* 網站 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">網站</span>
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="例如：https://www.restaurant.com"
                className={`input input-bordered w-full ${errors.website ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.website && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.website}</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 商店設定 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 flex items-center">
            <FaStore className="w-5 h-5 text-primary" />
            商店設定
          </h2>

          {/* 啟用狀態 */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-semibold">啟用商店</span>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="checkbox checkbox-primary"
                disabled={isLoading}
              />
            </label>
            <label className="label">
              <span className="label-text-alt">
                啟用後商店將出現在活動建立的選項中
              </span>
            </label>
            {errors.is_active && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.is_active}</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FullShopFormProps extends Partial<Form2Props> {
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export default function FullShopForm({
  initialValues,
  loading = false,
  mode = 'edit',
  onFinish,
  onFinishFailed,
  onValuesChange,
  ...props
}: FullShopFormProps) {

  const router = useRouter();
  return (
    <Form2
      initialValues={initialValues}
      onValuesChange={(changedValues, allValues) => {
        console.log('Changed Values:', changedValues);
        console.log('All Values:', allValues);
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      {...props}
    >
      <FormItem
        label='商店名稱'
        name='name'
        rules={[{ required: true, message: '商店名稱為必填' }]}
      >
        <Input
          name='name'
          placeholder='請輸入商店名稱'
        />
      </FormItem>
      <FormItem
        label='商店描述'
        name='description'
      >
        <TextArea
          name='description'
          placeholder='請輸入商店描述'
        />
      </FormItem>
      <FormItem
        label='地址'
        name='address'
      >
        <Input
          name='address'
          placeholder='請輸入地址'
        />
      </FormItem>
      <FormItem
        label='電話'
        name='phone'
      >
        <Input
          name='phone'
          placeholder='請輸入電話'
        />
      </FormItem>
      <FormItem
        label='電子郵件'
        name='email'
      >
        <Input
          name='email'
          placeholder='請輸入電子郵件'
        />
      </FormItem>
      <FormItem
        label='網站'
        name='website'
      >
        <Input
          name='website'
          placeholder='請輸入網站'
        />
      </FormItem>
      <FormItem
        label='啟用商店'
        name='is_active'
        valuePropName='checked'
      >
        <Checkbox
          label='啟用後商店將出現在活動建立的選項中'
        />
      </FormItem>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
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
              {mode === 'create' ? '新增商店' : '更新商店'}
            </>
          )}
        </button>
      </div>
    </Form2>
  );
}

/**
 * 商店表單資料的初始值
 */
export const getInitialShopFormData = (): ShopFormData => ({
  name: "",
  description: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  is_active: true
});

/**
 * 商店表單驗證函數
 */
export const validateShopForm = (data: ShopFormData): ShopFormErrors => {
  const errors: ShopFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "商店名稱為必填";
  }

  if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "電子郵件格式不正確";
  }

  if (data.website && !/^https?:\/\/.+/.test(data.website)) {
    errors.website = "網站格式不正確（需要包含 http:// 或 https://）";
  }

  return errors;
};

/**
 * 清理商店表單資料（移除空字串，轉為 null）
 */
export const cleanShopFormData = (data: ShopFormData) => ({
  name: data.name.trim(),
  description: data.description.trim() || null,
  address: data.address.trim() || null,
  phone: data.phone.trim() || null,
  email: data.email.trim() || null,
  website: data.website.trim() || null,
  is_active: data.is_active
});
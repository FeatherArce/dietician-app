"use client";
import React, { useState } from 'react';
import { authFetch } from '@/libs/auth-fetch';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSave,
  FaTimes,
  FaList
} from 'react-icons/fa';

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  _count?: {
    items: number;
  };
}

interface MenuCategoryFormData {
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

interface MenuCategoryManagerProps {
  shopId: string;
  menuId: string;
  categories: MenuCategory[];
  onCategoriesChange: (categories: MenuCategory[]) => void;
  isReadOnly?: boolean;
}

export default function MenuCategoryManager({
  shopId,
  menuId,
  categories,
  onCategoriesChange,
  isReadOnly = false
}: MenuCategoryManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState<MenuCategoryFormData>({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sort_order: Math.max(...categories.map(c => c.sort_order), -1) + 1,
      is_active: true
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '分類名稱為必填';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading('create');
    try {
      const response = await authFetch(`/api/lunch/shops/${shopId}/menus/${menuId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim() || null
        })
      });

      const data = await response.json();

      if (data.success) {
        onCategoriesChange([...categories, data.category]);
        setIsCreating(false);
        resetForm();
      } else {
        setErrors({ submit: data.error || '建立分類失敗' });
      }
    } catch {
      setErrors({ submit: '建立分類失敗' });
    } finally {
      setLoading(null);
    }
  };

  const handleUpdate = async (categoryId: string) => {
    if (!validateForm()) return;

    setLoading(`update-${categoryId}`);
    try {
      const response = await authFetch(`/api/lunch/shops/${shopId}/menus/${menuId}/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim() || null
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedCategories = categories.map(cat =>
          cat.id === categoryId ? { ...cat, ...data.category } : cat
        );
        onCategoriesChange(updatedCategories);
        setEditingId(null);
        resetForm();
      } else {
        setErrors({ submit: data.error || '更新分類失敗' });
      }
    } catch {
      setErrors({ submit: '更新分類失敗' });
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('確定要刪除此分類嗎？此操作將同時刪除分類下的所有項目。')) {
      return;
    }

    setLoading(`delete-${categoryId}`);
    try {
      const response = await authFetch(`/api/lunch/shops/${shopId}/menus/${menuId}/categories/${categoryId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        const updatedCategories = categories.filter(cat => cat.id !== categoryId);
        onCategoriesChange(updatedCategories);
      } else {
        setErrors({ submit: data.error || '刪除分類失敗' });
      }
    } catch {
      setErrors({ submit: '刪除分類失敗' });
    } finally {
      setLoading(null);
    }
  };

  const startEdit = (category: MenuCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      sort_order: category.sort_order,
      is_active: category.is_active
    });
    setEditingId(category.id);
    setIsCreating(false);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
        name === 'sort_order' ? parseInt(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-4">
      {/* 標題和新增按鈕 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <FaList className="w-4 h-4 text-primary" />
          <span>菜單分類</span>
          <span className="badge badge-outline badge-sm">
            {categories.length} 個分類
          </span>
        </h3>
        {!isReadOnly && !isCreating && !editingId && (
          <button
            onClick={startCreate}
            className="btn btn-primary btn-sm"
          >
            <FaPlus className="w-3 h-3" />
            新增分類
          </button>
        )}
      </div>

      {/* 錯誤訊息 */}
      {errors.submit && (
        <div className="alert alert-error">
          <span>{errors.submit}</span>
        </div>
      )}

      {/* 新增分類表單 */}
      {isCreating && (
        <div className="card bg-base-200 border-2 border-dashed border-primary">
          <div className="card-body">
            <h4 className="card-title text-sm">新增分類</h4>
            <div className="space-y-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">分類名稱 *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input input-bordered input-sm ${errors.name ? 'input-error' : ''}`}
                  placeholder="例如：主食、湯品、飲料"
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">分類描述</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered textarea-sm"
                  placeholder="選填：分類說明"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">排序</span>
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    className="input input-bordered input-sm"
                    min="0"
                  />
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">啟用</span>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="toggle toggle-primary toggle-sm"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelEdit}
                  className="btn btn-ghost btn-sm"
                >
                  <FaTimes className="w-3 h-3" />
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading === 'create'}
                  className="btn btn-primary btn-sm"
                >
                  {loading === 'create' ? (
                    <FaSpinner className="w-3 h-3 animate-spin" />
                  ) : (
                    <FaSave className="w-3 h-3" />
                  )}
                  建立
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分類列表 */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="card bg-base-100 border">
            <div className="card-body p-4">
              {editingId === category.id ? (
                /* 編輯模式 */
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">分類名稱 *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`input input-bordered input-sm ${errors.name ? 'input-error' : ''}`}
                    />
                    {errors.name && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.name}</span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">分類描述</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="textarea textarea-bordered textarea-sm"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">排序</span>
                      </label>
                      <input
                        type="number"
                        name="sort_order"
                        value={formData.sort_order}
                        onChange={handleInputChange}
                        className="input input-bordered input-sm"
                        min="0"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">啟用</span>
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          className="toggle toggle-primary toggle-sm"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEdit}
                      className="btn btn-ghost btn-sm"
                    >
                      <FaTimes className="w-3 h-3" />
                      取消
                    </button>
                    <button
                      onClick={() => handleUpdate(category.id)}
                      disabled={loading === `update-${category.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      {loading === `update-${category.id}` ? (
                        <FaSpinner className="w-3 h-3 animate-spin" />
                      ) : (
                        <FaSave className="w-3 h-3" />
                      )}
                      儲存
                    </button>
                  </div>
                </div>
              ) : (
                /* 檢視模式 */
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{category.name}</h4>
                      <span className={`badge badge-sm ${category.is_active ? 'badge-success' : 'badge-error'}`}>
                        {category.is_active ? '啟用' : '停用'}
                      </span>
                      <span className="badge badge-outline badge-sm">
                        排序: {category.sort_order}
                      </span>
                      {category._count && (
                        <span className="badge badge-info badge-sm">
                          {category._count.items} 個項目
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-base-content/70 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {!isReadOnly && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(category)}
                        disabled={isCreating || editingId !== null}
                        className="btn btn-ghost btn-sm btn-square"
                      >
                        <FaEdit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={loading === `delete-${category.id}` || isCreating || editingId !== null}
                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error hover:text-error-content"
                      >
                        {loading === `delete-${category.id}` ? (
                          <FaSpinner className="w-3 h-3 animate-spin" />
                        ) : (
                          <FaTrash className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !isCreating && (
        <div className="text-center py-8 text-base-content/50">
          <FaList className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>尚未建立任何分類</p>
          {!isReadOnly && (
            <button
              onClick={startCreate}
              className="btn btn-primary btn-sm mt-3"
            >
              <FaPlus className="w-3 h-3" />
              建立第一個分類
            </button>
          )}
        </div>
      )}
    </div>
  );
}
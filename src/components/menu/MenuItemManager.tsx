"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { authFetch } from '@/libs/auth-fetch';
import { DEFAULT_VALUES } from '@/constants/app-constants';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSave,
  FaTimes,
  FaUtensils,
  FaDollarSign
} from 'react-icons/fa';
import { MenuCategory } from './MenuCategoryManager';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  is_available: boolean;
  sort_order: number;
  image_url?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_available: boolean;
  sort_order: number;
  image_url: string;
}

interface MenuItemManagerProps {
  menuId: string;
  items: MenuItem[];
  categories: MenuCategory[];
  onItemsChange: (items: MenuItem[]) => void;
  isReadOnly?: boolean;
}

export default function MenuItemManager({
  menuId,
  items,
  categories,
  onItemsChange,
  isReadOnly = false
}: MenuItemManagerProps) {
  console.log("MenuItemManager", {categories, items});
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    is_available: true,
    sort_order: 0,
    image_url: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category_id: categories?.length > 0 ? categories[0].id : '',
      is_available: true,
      sort_order: Math.max(...(items || []).map(i => i.sort_order), -1) + 1,
      image_url: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '項目名稱為必填';
    }
    
    if (formData.price < 0) {
      newErrors.price = '價格不能為負數';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading('create');
    try {
      const response = await authFetch(`/api/lunch/menus/${menuId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category_id: formData.category_id || null,
          image_url: formData.image_url.trim() || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onItemsChange([...(items || []), data.item]);
        setIsCreating(false);
        resetForm();
      } else {
        setErrors({ submit: data.error || '建立項目失敗' });
      }
    } catch {
      setErrors({ submit: '建立項目失敗' });
    } finally {
      setLoading(null);
    }
  };

  const handleUpdate = async (itemId: string) => {
    if (!validateForm()) return;

    setLoading(`update-${itemId}`);
    try {
      const response = await authFetch(`/api/lunch/menus/${menuId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category_id: formData.category_id || null,
          image_url: formData.image_url.trim() || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const updatedItems = items?.map(item => 
          item.id === itemId ? { ...item, ...data.item } : item
        );
        onItemsChange(updatedItems);
        setEditingId(null);
        resetForm();
      } else {
        setErrors({ submit: data.error || '更新項目失敗' });
      }
    } catch {
      setErrors({ submit: '更新項目失敗' });
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('確定要刪除此項目嗎？')) {
      return;
    }

    setLoading(`delete-${itemId}`);
    try {
      const response = await authFetch(`/api/lunch/menus/${menuId}/items/${itemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        const updatedItems = items?.filter(item => item.id !== itemId);
        onItemsChange(updatedItems);
      } else {
        setErrors({ submit: data.error || '刪除項目失敗' });
      }
    } catch {
      setErrors({ submit: '刪除項目失敗' });
    } finally {
      setLoading(null);
    }
  };

  const startEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id || '',
      is_available: item.is_available,
      sort_order: item.sort_order,
      image_url: item.image_url || ''
    });
    setEditingId(item.id);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'price' || name === 'sort_order' ? parseFloat(value) || 0 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return DEFAULT_VALUES.UNCATEGORIZED_NAME;
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || '未知分類';
  };

  // 按分類分組顯示項目
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    
    items?.forEach(item => {
      const categoryId = item.category_id || 'uncategorized';
      if (!groups[categoryId]) {
        groups[categoryId] = [];
      }
      groups[categoryId].push(item);
    });
    
    return groups;
  }, [items]);

  return (
    <div className="space-y-4">
      {/* 標題和新增按鈕 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <FaUtensils className="w-4 h-4 text-primary" />
          <span>菜單項目</span>
          <span className="badge badge-outline badge-sm">
            {items?.length || 0} 個項目
          </span>
        </h3>
        {!isReadOnly && !isCreating && !editingId && (
          <button
            onClick={startCreate}
            className="btn btn-primary btn-sm"
          >
            <FaPlus className="w-3 h-3" />
            新增項目
          </button>
        )}
      </div>

      {/* 提示訊息 */}
      {categories?.length === 0 && (
        <div className="alert alert-info">
          <span>尚無分類，新增的項目將歸類為「{DEFAULT_VALUES.UNCATEGORIZED_NAME}」</span>
        </div>
      )}

      {/* 錯誤訊息 */}
      {errors.submit && (
        <div className="alert alert-error">
          <span>{errors.submit}</span>
        </div>
      )}

      {/* 新增項目表單 */}
      {isCreating && (
        <div className="card bg-base-200 border-2 border-dashed border-primary">
          <div className="card-body">
            <h4 className="card-title text-sm">新增項目</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">項目名稱 *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input input-bordered input-sm ${errors.name ? 'input-error' : ''}`}
                    placeholder="例如：招牌牛肉麵"
                  />
                  {errors.name && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.name}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">價格 *</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`input input-bordered input-sm ${errors.price ? 'input-error' : ''}`}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                  {errors.price && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.price}</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">項目描述</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered textarea-sm"
                  placeholder="選填：項目說明、成分、特色等"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">分類</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="select select-bordered select-sm"
                  >
                    <option value="">{DEFAULT_VALUES.UNCATEGORIZED_NAME}</option>
                    {categories?.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleInputChange}
                      className="toggle toggle-primary toggle-sm"
                    />
                  </label>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">圖片網址</span>
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="input input-bordered input-sm"
                  placeholder="選填：https://example.com/image.jpg"
                />
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

      {/* 項目列表 (按分類分組) */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([categoryId, categoryItems]) => (
          <div key={categoryId} className="space-y-2">
            <h4 className="text-sm font-medium text-base-content/70 border-b pb-1">
              {getCategoryName(categoryId)} ({categoryItems.length} 個項目)
            </h4>
            
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div key={item.id} className="card bg-base-100 border">
                  <div className="card-body p-4">
                    {editingId === item.id ? (
                      /* 編輯模式 */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">項目名稱 *</span>
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
                              <span className="label-text">價格 *</span>
                            </label>
                            <input
                              type="number"
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              className={`input input-bordered input-sm ${errors.price ? 'input-error' : ''}`}
                              min="0"
                              step="1"
                            />
                            {errors.price && (
                              <label className="label">
                                <span className="label-text-alt text-error">{errors.price}</span>
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">項目描述</span>
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="textarea textarea-bordered textarea-sm"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">分類</span>
                            </label>
                            <select
                              name="category_id"
                              value={formData.category_id}
                              onChange={handleInputChange}
                              className="select select-bordered select-sm"
                            >
                              <option value="">{DEFAULT_VALUES.UNCATEGORIZED_NAME}</option>
                              {categories?.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>

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
                                name="is_available"
                                checked={formData.is_available}
                                onChange={handleInputChange}
                                className="toggle toggle-primary toggle-sm"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">圖片網址</span>
                          </label>
                          <input
                            type="url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleInputChange}
                            className="input input-bordered input-sm"
                          />
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
                            onClick={() => handleUpdate(item.id)}
                            disabled={loading === `update-${item.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            {loading === `update-${item.id}` ? (
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
                        <div className="flex space-x-3 flex-1">
                          {item.image_url && (
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-lg">
                                <Image 
                                  src={item.image_url} 
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{item.name}</h4>
                              <span className={`badge badge-sm ${item.is_available ? 'badge-success' : 'badge-error'}`}>
                                {item.is_available ? '供應' : '停售'}
                              </span>
                              <span className="badge badge-outline badge-sm">
                                排序: {item.sort_order}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-lg font-bold text-primary flex items-center">
                                <FaDollarSign className="w-3 h-3" />
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            
                            {item.description && (
                              <p className="text-sm text-base-content/70 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {!isReadOnly && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => startEdit(item)}
                              disabled={isCreating || editingId !== null}
                              className="btn btn-ghost btn-sm btn-square"
                            >
                              <FaEdit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={loading === `delete-${item.id}` || isCreating || editingId !== null}
                              className="btn btn-ghost btn-sm btn-square text-error hover:bg-error hover:text-error-content"
                            >
                              {loading === `delete-${item.id}` ? (
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
          </div>
        ))}
      </div>

      {(!items || items?.length === 0) && !isCreating && (
        <div className="text-center py-8 text-base-content/50">
          <FaUtensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>尚未建立任何項目</p>
          {!isReadOnly && (
            <button
              onClick={startCreate}
              className="btn btn-primary btn-sm mt-3"
            >
              <FaPlus className="w-3 h-3" />
              建立第一個項目
            </button>
          )}
        </div>
      )}
    </div>
  );
}
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
import MenuItemTable from './MenuItemTable';

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
  console.log("MenuItemManager", { categories, items });
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
      </div>

      <MenuItemTable
        menuId={menuId}
      />
    </div>
  );
}
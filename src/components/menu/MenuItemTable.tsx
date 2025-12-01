import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import DataTable from '../DataTable'
import { IShopMenuItem } from '@/types/LunchEvent'
import { formatCurrency } from '@/libs/formatter'
import { FaEdit, FaPlus, FaSpinner, FaTrash, FaUtensils } from 'react-icons/fa';
import { getLunchShopMenuItems } from '@/services/client/lunch/lunch-shop';
import Modal, { ModalRef } from '../Modal';
import MenuItemForm from './MenuItemForm';
import { FormRef, FormValues } from '../form/types';
import { createLunchShopMenuItem, updateLunchShopMenuItem, deleteLunchShopMenuItem } from '@/services/client/lunch/lunch-shop';
import { toast } from '../Toast';
import { useLunchShopMenuItems } from '@/services/client/lunch/useLunchShop';
import { FiRefreshCw } from 'react-icons/fi';
import BatchImportMenuModal from './BatchImportMenuModal';

interface MenuItemTableProps {
    shopId: string;
    menuId: string;
    loading?: boolean;
}

interface MenuItemTableModalSettings {
    mode: 'create' | 'edit';
    item?: IShopMenuItem;
}

export default function MenuItemTable({
    shopId,
    menuId,
    loading = false,
}: MenuItemTableProps) {
    const formRef = useRef<FormRef>(null);
    const modalRef = useRef<ModalRef>(null);
    const { menuItems: shopMenuItems, isLoading: isGetMenuItemsLoading, isError, mutate } = useLunchShopMenuItems(shopId, menuId);
    const [isLoading, setIsLoading] = useState(false);
    const [modalSettings, setModalSettings] = useState<MenuItemTableModalSettings>({
        mode: 'create',
    });
    const [batchImportOpen, setBatchImportOpen] = useState(false);

    const modalOpenHandler = useCallback((mode: 'create' | 'edit', item?: IShopMenuItem) => {
        setModalSettings({ mode, item });
        if (mode === 'edit' && item) {
            formRef.current?.setFieldsValue(item);
        } else {
            formRef.current?.setFieldsValue({ is_available: true });
        }
        modalRef.current?.open();
    }, []);

    const modalCloseHandler = useCallback(() => {
        setModalSettings(s => ({ mode: 'create', item: undefined }));
        formRef.current?.reset();
        modalRef.current?.close();
    }, []);

    const handleDelete = useCallback(async (itemId: string) => {
        if (!shopId) {
            toast.error('Shop ID is missing for deletion');
            return;
        }
        if (!menuId) {
            toast.error('Menu ID is missing for deletion');
            return;
        }
        if (!itemId) {
            toast.error('Item ID is missing for deletion');
            return;
        }

        if (!window.confirm('確定要刪除這個項目嗎？')) {
            return;
        }
        try {
            setIsLoading(true);
            await mutate(async (oldData) => {
                if (!oldData) return oldData;

                const res = await deleteLunchShopMenuItem(shopId, menuId, itemId);
                console.log('刪除結果', res);
                const newItems = (oldData?.data?.items || []).filter(item => item.id !== itemId);
                return {
                    ...oldData,
                    data: {
                        ...oldData?.data,
                        items: newItems
                    }
                };
            }, {
                rollbackOnError: true, // 啟用回滾機制
                revalidate: false      // 成功後不重新獲取列表
            });
            toast.success('刪除成功');
        } catch (e) {
            toast.error('刪除失敗');
        } finally {
            setIsLoading(false);
        }
    }, [mutate, shopId, menuId]);

    const handleCreate = useCallback(async (values: FormValues) => {
        console.log('Creating item with values:', {
            values,
            shopId,
            menuId,
        });
        if (!shopId) {
            toast.error('Shop ID is missing for creation');
            return;
        }
        if (!menuId) {
            toast.error('Menu ID is missing for creation');
            return;
        }
        try {
            setIsLoading(true);
            await createLunchShopMenuItem(shopId, menuId, values);
            modalCloseHandler();
            await mutate();
            toast.success('新增成功');
        } catch (e) {
            console.error('新增失敗', e);
            toast.error('新增失敗');
        } finally {
            setIsLoading(false);
        }
    }, [shopId, menuId, mutate, modalCloseHandler]);

    const handleUpdate = useCallback(async (id: string, values: FormValues) => {
        console.log('Updating item with values:', values);
        if (!id) {
            toast.error('Item ID is missing for update');
            return;
        }
        if (!menuId) {
            toast.error('Menu ID is missing for update');
            return;
        }
        try {
            setIsLoading(true);
            await updateLunchShopMenuItem(menuId, id, values);
            modalCloseHandler();
            await mutate();
            toast.success('更新成功');
        } catch (e) {
            console.error('更新失敗', e);
            toast.error('更新失敗');
        } finally {
            setIsLoading(false);
        }
    }, [mutate, menuId, modalCloseHandler]);

    const handleFinish = useCallback(async (values: FormValues) => {
        if (modalSettings.mode === 'create') {
            await handleCreate(values);
        } else if (modalSettings.mode === 'edit' && modalSettings.item) {
            await handleUpdate(modalSettings.item.id, values);
        }
    }, [handleCreate, handleUpdate, modalSettings.mode, modalSettings.item]);

    return (
        <div className='grid gap-2'>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <FaUtensils className="w-4 h-4 text-primary" />
                    <span>菜單項目</span>
                    <span className="badge badge-outline badge-sm">
                        {shopMenuItems?.length || 0} 個項目
                    </span>
                </h3>
            </div>
            <div className="mb-2 flex justify-end gap-2">
                <button
                    className="btn btn-secondary btn-sm ml-2"
                    onClick={async () => {
                        await mutate();
                        toast.success('已重新整理菜單項目');
                    }}
                >
                    <FiRefreshCw className="w-3 h-3" />
                </button>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                        modalOpenHandler('create');
                    }}
                >
                    <FaPlus className="w-3 h-3" />
                </button>
                <button
                    className="btn btn-secondary btn-sm "
                    onClick={() => setBatchImportOpen(true)}
                >
                    批次新增
                </button>
            </div>
            <DataTable<IShopMenuItem>
                loading={loading}
                dataSource={shopMenuItems}
                columns={[
                    // { key: 'sort_order', title: '排序順序', },
                    { key: 'name', title: '項目名稱', sortable: true, },
                    { key: 'description', title: '描述', },
                    { key: 'price', title: '價格', sortable: true, render: (value, record) => formatCurrency(record.price) },
                    { key: 'is_available', title: '是否可用', sortable: true, render: (v, r) => r.is_available ? '是' : '否' },
                    {
                        key: 'actions', title: '操作', render: (value, record) => (
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => modalOpenHandler('edit', record)}
                                    disabled={isLoading}
                                    className="btn btn-ghost btn-sm btn-square"
                                >
                                    <FaEdit className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => handleDelete(record.id)}
                                    disabled={isLoading}
                                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error hover:text-error-content"
                                >
                                    {isLoading ? (
                                        <FaSpinner className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <FaTrash className="w-3 h-3" />
                                    )}
                                </button>
                            </div>
                        )
                    },
                ]}
            />

            <Modal
                ref={modalRef}
                id='menu-item-form-modal'
                title={modalSettings.mode === 'create' ? '新增菜單項目' : '編輯菜單項目'}
            >
                <MenuItemForm
                    ref={formRef}
                    loading={isLoading || isGetMenuItemsLoading}
                    initialValues={(modalSettings.mode === 'edit' && modalSettings.item) ? modalSettings.item : {}}
                    onFinish={handleFinish}
                    onCancel={modalCloseHandler}
                />
            </Modal>

            <BatchImportMenuModal
                open={batchImportOpen}
                onImport={(data) => { }}
            />
        </div>
    )
}

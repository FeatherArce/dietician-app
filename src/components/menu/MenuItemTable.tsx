import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import DataTable from '../DataTable'
import { IShopMenuItem } from '@/types/LunchEvent'
import { formatCurrency } from '@/libs/formatter'
import { FaEdit, FaPlus, FaSpinner, FaTrash } from 'react-icons/fa';
import { getLunchShopMenuItems } from '@/services/client/lunch/lunch-shop';
import Modal, { ModalRef } from '../Modal';
import MenuItemForm from './MenuItemForm';
import { Form2Ref, FormValues } from '../form2/types';
import { createLunchShopMenuItem, updateLunchShopMenuItem, deleteLunchShopMenuItem } from '@/services/client/lunch/lunch-shop';
import { toast } from '../Toast';

interface MenuItemTableProps {
    menuId: string;
}

interface MenuItemTableModalSettings {
    mode: 'create' | 'edit';
    item?: IShopMenuItem;
}

export default function MenuItemTable({
    menuId
}: MenuItemTableProps) {
    const formRef = useRef<Form2Ref>(null);
    const modalRef = useRef<ModalRef>(null);
    const [isPending, startTransition] = useTransition();
    const [menuItems, setMenuItems] = useState<IShopMenuItem[]>([]);
    const [modalSettings, setModalSettings] = useState<MenuItemTableModalSettings>({
        mode: 'create',
    });

    const getMenuItems = useCallback(async () => {
        if (!menuId) return;
        try {
            const { response, result } = await getLunchShopMenuItems(menuId);
            console.log('Menu Items Response:', response);
            if (result && Array.isArray(result.items)) {
                setMenuItems(result.items);
            } else {
                setMenuItems([]);
            }
        } catch (error) {
            setMenuItems([]);
        }
    }, [menuId]);

    useEffect(() => {
        // 避免 effect 直接 setState，改用 async function
        (async () => { await getMenuItems(); })();
    }, [getMenuItems]);

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
        if (!itemId) return;
        if (!window.confirm('確定要刪除這個項目嗎？')) return;
        startTransition(async () => {
            try {
                await deleteLunchShopMenuItem(menuId, itemId);
                await getMenuItems();
            } catch (e) {
                alert('刪除失敗');
            }
        });
    }, [getMenuItems, menuId]);

    const handleCreate = useCallback(async (values: FormValues) => {
        if (!menuId) return;
        startTransition(async () => {
            try {
                await createLunchShopMenuItem(menuId, values);
                modalCloseHandler();
                await getMenuItems();
                toast.success('新增成功');
            } catch (e) {
                console.error('新增失敗', e);
                toast.error('新增失敗');
            }
        });
    }, [menuId, getMenuItems, modalCloseHandler]);

    const handleUpdate = useCallback(async (id: string, values: FormValues) => {
        if (!id) return;
        startTransition(async () => {
            try {
                await updateLunchShopMenuItem(menuId, id, values);
                modalCloseHandler();
                await getMenuItems();
                toast.success('更新成功');
            } catch (e) {
                console.error('更新失敗', e);
                toast.error('更新失敗');
            }
        });
    }, [getMenuItems, menuId, modalCloseHandler]);

    const handleFinish = useCallback(async (values: FormValues) => {
        if (modalSettings.mode === 'create') {
            await handleCreate(values);
        } else if (modalSettings.mode === 'edit' && modalSettings.item) {
            await handleUpdate(modalSettings.item.id, values);
        }
    }, [handleCreate, handleUpdate, modalSettings.mode, modalSettings.item]);

    return (
        <div className='grid gap-2'>
            <div className="mb-2 flex justify-end">
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                        modalOpenHandler('create');
                    }}
                >
                    <FaPlus className="w-3 h-3" />
                    新增菜單項目
                </button>
            </div>
            <DataTable<IShopMenuItem>
                dataSource={menuItems}
                columns={[
                    // { key: 'sort_order', title: '排序順序', },
                    { key: 'name', title: '項目名稱', },
                    { key: 'description', title: '描述', },
                    { key: 'price', title: '價格', render: (value, record) => formatCurrency(record.price) },
                    { key: 'is_available', title: '是否可用', render: (v, r) => r.is_available ? '是' : '否' },
                    {
                        key: 'actions', title: '操作', render: (value, record) => (
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => modalOpenHandler('edit', record)}
                                    disabled={isPending}
                                    className="btn btn-ghost btn-sm btn-square"
                                >
                                    <FaEdit className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => handleDelete(record.id)}
                                    disabled={isPending}
                                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error hover:text-error-content"
                                >
                                    {isPending ? (
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
                title={modalSettings.mode === 'create' ? '新增項目' : '編輯項目'}
            >
                <MenuItemForm
                    ref={formRef}
                    loading={isPending}
                    initialValues={(modalSettings.mode === 'edit' && modalSettings.item) ? modalSettings.item : {}}
                    onFinish={handleFinish}
                    onCancel={modalCloseHandler}
                />
            </Modal>
        </div>
    )
}

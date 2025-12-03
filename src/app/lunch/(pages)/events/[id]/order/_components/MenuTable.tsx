import DataTable, { DataTableProps } from '@/components/DataTable';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Tabs from '@/components/ui/Tabs';
import ViewModeSwitchButton, { ViewModes } from '@/components/ViewModeSwitchButton'
import { formatCurrency } from '@/libs/formatter';
import { cn } from '@/libs/utils';
import { MenuCategory } from '@/prisma-generated/postgres-client';
import { MenuItemWithArgs, MenuWithArgs } from '@/types/api/lunch';
import { IShop, IShopMenu, IShopMenuCategory, IShopMenuItem } from '@/types/LunchEvent';
import React, { useMemo, useState } from 'react'
import { FaSearch, FaUtensils } from 'react-icons/fa';

interface MenuTableProps extends Omit<DataTableProps<any>, 'dataSource' | 'columns'> {
    shop?: IShop;
    allowCustomItems?: boolean;
    onMenuItemClick?: (item: IShopMenuItem) => void;
}

export default function MenuTable({
    shop,
    allowCustomItems,
    onMenuItemClick,
    ...props
}: MenuTableProps) {
    const [viewMode, setViewMode] = useState<ViewModes>(ViewModes.Table);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredMenus = useMemo(() => {
        const defaultCategoryId = 'default';
        return (shop?.menus || []).map((menu) => {
            const newMenu: IShopMenu = { ...menu, categories: [], items: [] };
            const categoryMap = new Map<string, MenuCategory & { items: Array<IShopMenuItem>; }>();

            categoryMap.set(defaultCategoryId, {
                id: defaultCategoryId,
                name: '預設',
                description: '',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                menu_id: '',
                sort_order: 0,
                items: (menu?.items || []).filter((item) => !item.category_id),
            });

            (menu?.categories || []).forEach((category) => {
                categoryMap.set(category.id, category);
            });

            const categories = Array.from(categoryMap.values());
            const filteredCategories = categories.filter((category) => {
                if (selectedCategory && category.id !== selectedCategory) {
                    return false;
                }
                return true;
            });
            const filteredCategoryWithItems = filteredCategories.map((category) => {
                const filteredItems = (category.items || []).filter((item) => {
                    if (searchTerm) {
                        const lowerSearchTerm = searchTerm.toLowerCase();
                        const lowerName = item.name?.toLowerCase();
                        const lowerDescription = item.description?.toLowerCase() || '';
                        if (!lowerName.includes(lowerSearchTerm) && !lowerDescription.includes(lowerSearchTerm)) {
                            return false;
                        }
                    }
                    return true;
                });
                return {
                    ...category,
                    items: filteredItems,
                };
            });

            newMenu.categories = filteredCategoryWithItems;
            return newMenu;
        });
    }, [shop, selectedCategory, searchTerm]);

    if (shop?.menus.length === 0) {
        return (
            <div className="text-center py-8 text-base-content/50">
                <FaUtensils className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>此活動尚未設定菜單</p>
                {allowCustomItems && (
                    <p className="mt-2">您可以使用上方的「自訂餐點」按鈕新增項目</p>
                )}
            </div>
        )
    }

    return (
        <div className='grid gap-2'>
            <div className='flex justify-between flex-col sm:flex-row gap-2'>
                <div className='flex flex-col lg:flex-row gap-2'>
                    {/* filters */}
                    <Select
                        placeholder='選擇分類'
                        value={selectedCategory}
                        onChange={(value) => setSelectedCategory(value as string)}
                        options={
                            (filteredMenus[0]?.categories || []).map(category => ({
                                label: category.name,
                                value: category.id
                            }))
                        }
                    />

                    <label className="input grid grid-cols-[auto_1fr] w-full min-w-50">
                        <FaSearch className="h-[1em] opacity-50" />
                        <input
                            type="search"
                            placeholder="搜尋餐點名稱或描述..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full'
                            list="meal-name-list"
                        />
                    </label>
                </div>
                <div>
                    <ViewModeSwitchButton
                        defaultMode={viewMode}
                        onChange={setViewMode}
                    />
                </div>
            </div>
            <div>
                {(filteredMenus || []).map((menu, index) => (
                    <Tabs
                        key={`tab-menu-${index}`}
                        items={(menu?.categories || []).map(category => ({
                            id: category.id,
                            label: category.name,
                            icon: <FaUtensils className="w-3 h-3 mr-1" />,
                            content: (<>
                                {viewMode === ViewModes.Cards ? (<>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {(category.items || []).map(item => (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    'card border cursor-pointer transition-all hover:shadow-md',
                                                    !item.is_available ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
                                                )}
                                                onClick={() => item.is_available && onMenuItemClick?.(item)}
                                            >
                                                <div className="card-body p-4">
                                                    <h4 className="font-semibold text-sm">{item.name}</h4>
                                                    {item.description && (
                                                        <p className="text-xs text-base-content/70 mb-2">{item.description}</p>
                                                    )}
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-primary font-bold">${item.price}</span>
                                                        <div className={`badge badge-sm ${item.is_available ? 'badge-success' : 'badge-error'}`}>
                                                            {item.is_available ? '供應中' : '停售'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>) : (<>
                                    <DataTable<IShopMenuItem>
                                        pagination={false}
                                        dataSource={category.items || []}
                                        columns={[
                                            {
                                                key: 'category.name',
                                                title: '分類名稱',
                                                width: 100,
                                                render: (value) => {
                                                    const newValue = value as string;
                                                    return !newValue ? '預設' : newValue;
                                                }
                                            },
                                            { key: 'name', title: '菜單項目名稱' },
                                            { key: 'description', title: '描述' },
                                            { key: 'price', title: '價格', render: (_, record) => formatCurrency(record.price) },
                                            {
                                                key: 'actions',
                                                title: '操作',
                                                render: (_, record) => (<button
                                                    className="btn btn-sm btn-accent btn-outline"
                                                    onClick={() => onMenuItemClick?.(record)}
                                                >
                                                    點餐
                                                </button>)
                                            },
                                        ]}
                                        {...props}
                                    />
                                </>)}

                                {(!category.items || (category.items || []).length === 0) && (
                                    <div className="col-span-full text-center py-8 text-base-content/50">
                                        此分類暫無餐點
                                    </div>
                                )}
                            </>)
                        }))}
                        variant="boxed"
                    />
                ))}

            </div>
        </div>
    )
}

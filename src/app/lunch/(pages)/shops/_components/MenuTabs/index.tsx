import Tabs, { TabItem } from '@/components/ui/Tabs'
import { IShop } from '@/types/LunchEvent';
import React, { useMemo } from 'react'

interface MenuTabsProps {
    shop?: IShop;
}

export default function MenuTabs({ shop }: MenuTabsProps) {
    const tabItems: TabItem[] = useMemo(() => {
        return (shop?.menus || []).map((menu) => ({
            id: menu.id,
            label: menu.name,
            content: (<></>),
        }));
    }, [shop]);

    return (
        <div>
            <Tabs
                items={[
                    { id: '', label: '菜單詳情', content: (<></>) },
                ]}
            />

        </div>
    )
}

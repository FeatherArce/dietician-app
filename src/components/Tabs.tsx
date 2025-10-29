"use client";
import { cn } from '@/libs/utils';
import { useState, ReactNode, Children, isValidElement, cloneElement, useMemo, useEffect, useCallback } from 'react';

export interface TabItem {
    id: string;
    label: string;
    content: ReactNode;
    disabled?: boolean;
    icon?: ReactNode;
}

export interface TabsProps {
    items: TabItem[];
    activeTab?: string;
    variant?: 'default' | 'bordered' | 'lifted' | 'boxed';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    position?: 'top' | 'bottom';
    className?: string;
    onTabChange?: (tabId: string) => void;
}

export default function Tabs({
    items,
    activeTab,
    variant = 'default',
    size = 'md',
    position = 'top',
    className = '',
    onTabChange
}: TabsProps) {

    // 支援 controlled (透過 activeTab prop) 與 uncontrolled 使用
    const defaultTab = items[0]?.id ?? '';
    const [internalTab, setInternalTab] = useState<string>(defaultTab);
    // 如果 internalTab 不存在於 items（例如 items 變更），render 時改用 defaultTab，避免在 effect 中 setState
    const currentTab = activeTab ?? (items.some((it) => it.id === internalTab) ? internalTab : defaultTab);

    const styles = useMemo(() => {
        const tabVariant = variant === 'default' ? 'tabs-box' : `tabs-${variant}`;
        const tabSize = size === 'md' ? '' : `tabs-${size}`;
        const tabPosition = position === 'top' ? '' : `tabs-${position}`;
        return cn('tabs', tabVariant, tabSize, tabPosition, className);
    }, [variant, size, position, className]);

    const handleTabChange = useCallback((tabId: string) => {
        // 只有在 uncontrolled 時更新 internal state
        if (activeTab === undefined) setInternalTab(tabId);
        onTabChange?.(tabId);
    }, [onTabChange, activeTab]);

    return (
        <div className="w-full grid grid-rows-[auto_1fr]">
            <div role="tablist" className={styles}>
                {(items || []).map((item) => (
                    <a
                        key={`tab-btn-${item.id}`}
                        role="tab"
                        className={`px-2 tab ${item.id === currentTab ? 'tab-active' : ''}`}
                        onClick={() => {
                            handleTabChange(item.id);
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </a>
                ))}
            </div>
            <div className="tab-content-container">
                {(items || []).map((item) => (
                    <div
                        key={`tab-content-${item.id}`}
                        className={`tab-content border-base-300 bg-base-100 p-6 ${item.id === currentTab ? 'block' : 'hidden'}`}
                    >
                        {item.content}
                    </div>
                ))}
            </div>
        </div>
    );
}
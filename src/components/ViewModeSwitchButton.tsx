import React, { useEffect, useState } from 'react'
import { FaThLarge, FaTable } from 'react-icons/fa';

export enum ViewModes {
    Cards = 'cards',
    Table = 'table'
}

interface ViewModeSwitchButtonProps {
    defaultMode?: ViewModes;
    onChange?: (mode: ViewModes) => void;
}

export default function ViewModeSwitchButton({ defaultMode = ViewModes.Cards, onChange }: ViewModeSwitchButtonProps) {
    const [viewMode, setViewMode] = useState<ViewModes>(defaultMode);

    useEffect(() => {
        if (onChange) {
            onChange(viewMode);
        }
    }, [viewMode, onChange]);

    return (
        <div className="btn-group">
            <button
                className={`btn btn-sm ${viewMode === ViewModes.Cards ? 'btn-active' : 'btn-outline'}`}
                onClick={() => setViewMode(ViewModes.Cards)}
            >
                <FaThLarge className="w-4 h-4" />
                卡片
            </button>
            <button
                className={`btn btn-sm ${viewMode === ViewModes.Table ? 'btn-active' : 'btn-outline'}`}
                onClick={() => setViewMode(ViewModes.Table)}
            >
                <FaTable className="w-4 h-4" />
                表格
            </button>
        </div>
    )
}

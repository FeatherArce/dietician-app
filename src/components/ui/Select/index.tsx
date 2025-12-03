'use client';
import { forwardRef, useCallback, useMemo, useState } from "react";
import { RiCloseCircleFill } from 'react-icons/ri';
import { Select as SelectField } from "@/components/SearchContainer/SearchFields";
import { FaTimes } from "react-icons/fa";
import './index.css';
import { cn } from "@/libs/utils";

function random() {
    return Math.random();
}

// 選擇框組件
export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

// 支援的值類型，參考自 HTMLSelectElement 的 value 屬性類型
type SelectValueType = string | readonly string[] | number | undefined;

// 會繼承自 HTMLSelectElement 的下拉選單，但排除原本的 onChange 屬性
export interface SelectProps<T = string> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
    // override value to be generic
    size?: 'sm' | 'md' | 'lg';
    onChange?: (value: SelectValueType) => void;
    // apply props
    options: Array<{ value: SelectValueType; label: string }>;
    label?: string;
    placeholder?: string;
    // for Form integration
    error?: string | string[];
}

export default function Select({
    label,
    value,
    onChange,
    error,
    options = [],
    placeholder,
    size = 'md',
    className = '',
    ...props
}: SelectProps) {
    console.log('Select rendered with value:', value);
    const sizeClass = {
        sm: 'select-sm',
        md: '',
        lg: 'select-lg'
    }[size];
    const errorClass = error ? 'select-error' : '';

    const randomId = useMemo(() => {
        return `select-${random().toString(36)}`;
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log('Select value changed to:', e.target.value);
        onChange?.(e.target.value);
    }, [onChange]);

    const handleClear = useCallback(() => {
        console.log('Clear button clicked');
        onChange?.('');
    }, [onChange]);

    return (
        <div className="select-wrapper">
            <select
                id={randomId}
                className={cn(
                    'select select-bordered w-full',
                    sizeClass,
                    errorClass,
                    className
                )}
                value={value}
                onChange={handleChange}
                {...props}
            >
                <option value="">
                    {placeholder}
                </option>
                {options.map(({ label, value }, index) => (
                    <option key={`option-${label}-${value}-${index}`} value={value}>
                        {label}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className={cn("clear-button", (value !== "") ? 'show' : '')}
                onClick={handleClear}
                aria-label="清除選擇"
            >
                <FaTimes />
            </button>
        </div>
    );
    // return (
    //     <select
    //         ref={ref}
    //         value={value}
    //         onChange={(e) => onChange?.(e.target.value)}
    //         onBlur={onBlur}
    //         className={`select select-bordered w-full ${sizeClass} ${errorClass} ${className}`.trim()}
    //         {...props}
    //     >
    //         {placeholder && (
    //             <option value="" disabled>
    //                 {placeholder}
    //             </option>
    //         )}
    //         {options.map((option) => (
    //             <option
    //                 key={option.value}
    //                 value={option.value}
    //                 disabled={option.disabled}
    //             >
    //                 {option.label}
    //             </option>
    //         ))}
    //     </select>
    // );
};

import { forwardRef } from "react";
import { RiCloseCircleFill } from 'react-icons/ri';
import { Select as SelectField } from "@/components/SearchContainer/SearchFields";
import { FaTimes } from "react-icons/fa";

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
    layoutOptions?: React.SelectHTMLAttributes<HTMLDivElement>;
    options: Array<{ value: SelectValueType; label: string }>;
    label?: string;
    placeholder?: string;
    allowClear?: boolean; // 是否顯示清除按鈕
    // for Form integration
    error?: string | string[];
}

// export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
//     value?: string;
//     onChange?: (value: string) => void;
//     onBlur?: () => void;
//     error?: string | string[];
//     options?: SelectOption[];
//     placeholder?: string;
//     size?: 'sm' | 'md' | 'lg';
//     allowClear?: boolean;
// }

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
    label,
    value,
    onChange,
    onBlur,
    error,
    layoutOptions = {
        className: "w-full",
    },
    options = [],
    placeholder,
    size = 'md',
    className = '',
    allowClear,
    ...props
}, ref) => {
    const sizeClass = {
        sm: 'select-sm',
        md: '',
        lg: 'select-lg'
    }[size];
    const errorClass = error ? 'select-error' : '';
    const showClearButton = allowClear && value && value !== '';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    }

    const handleClear = () => {
        // 找到第一個空值選項，或使用空字串
        const defaultOption = options.find(opt => opt.value === '');
        if (defaultOption) {
            onChange?.(defaultOption.value);
        } else {
            onChange?.('');
        }
    };

    return (
        <div className={`form-control ${layoutOptions?.className}`}>
            {label && (
                <label className="label">
                    <span className="label-text">{label}</span>
                </label>
            )}
            {showClearButton ? (
                <div className="join w-full">
                    <select
                        className={`select select-bordered w-full ${sizeClass} ${errorClass} ${className}`.trim()}
                        value={value}
                        onChange={handleChange}
                        {...props}
                    >
                        <option value="" disabled>
                            {placeholder}
                        </option>
                        {options.map((option, label, index) => (
                            <option key={`option-${index}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="btn btn-neutral join-item"
                        title="清除選擇"
                    >
                        <FaTimes className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <select
                    className={`select select-bordered w-full ${sizeClass} ${errorClass} ${className}`.trim()}
                    value={value}
                    onChange={handleChange}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map(({ label, value }, index) => (
                        <option key={`option-${label}-${value}-${index}`} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            )}
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
});

Select.displayName = 'Select';

export default Select;
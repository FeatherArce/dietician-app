import { forwardRef } from "react";
import { RxCross1, RxCross2 } from "react-icons/rx";

// 基礎輸入框組件
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'value'> {
    value?: string | FileList;
    onChange?: (value: string | FileList) => void;
    onBlur?: () => void;
    error?: string | string[];
    size?: 'sm' | 'md' | 'lg';
    variant?: 'bordered' | 'ghost' | 'primary';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    value = '',
    onChange,
    onBlur,
    error,
    size = 'md',
    variant = 'bordered',
    className = '',
    type = 'text',
    ...props
}, ref) => {
    const sizeClass = {
        sm: 'input-sm',
        md: '',
        lg: 'input-lg'
    }[size];

    const variantClass = {
        bordered: 'input-bordered',
        ghost: 'input-ghost',
        primary: 'input-primary'
    }[variant];

    const errorClass = error ? 'input-error' : '';

    const handleClear = () => {
        onChange?.('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'file') {
            // 對於檔案輸入，傳遞 FileList 物件
            onChange?.(e.target.files as FileList);
        } else {
            // 對於其他輸入類型，傳遞字串值
            onChange?.(e.target.value);
        }
    };

    const inputValue = type === 'file' ? undefined : (value as string);

    return (
        <div className="relative w-full">
            <input
                ref={ref}
                type={type}
                value={inputValue}
                onChange={handleChange}
                onBlur={onBlur}
                className={`input w-full ${sizeClass} ${variantClass} ${errorClass} ${className}`.trim()}
                {...props}
            />
            {/* Clear button */}
            {inputValue && (
                <div className="absolute z-50 right-0 top-1/2 transform -translate-y-1/2 pr-2 flex justify-end items-center">
                    <div className="btn btn-circle btn-xs" onClick={handleClear}>
                        <RxCross2 className="w-3 h-3" />
                    </div>
                </div>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
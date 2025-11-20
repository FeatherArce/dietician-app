import { forwardRef, useState } from "react";
import { RxCross1, RxCross2 } from "react-icons/rx";

// 基礎輸入框組件
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'value'> {
    value?: string;
    onChange?: (value: string | FileList) => void;
    onBlur?: () => void;
    error?: string | string[];
    size?: 'sm' | 'md' | 'lg';
    variant?: 'bordered' | 'ghost' | 'primary';
    showPasswordToggle?: boolean;
    type?: 'password' | 'text';
}

const PasswordInput = forwardRef<HTMLInputElement, InputProps>(({
    value = '',
    onChange,
    onBlur,
    error,
    size = 'md',
    variant = 'bordered',
    className = '',
    type = 'password',
    showPasswordToggle = true,
    disabled,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const currentType = isPasswordField && showPassword ? "text" : type;

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className="relative w-full">
            <input
                ref={ref}
                value={value}
                type={currentType}
                onChange={handleChange}
                onBlur={onBlur}
                disabled={disabled}
                className={`input w-full ${sizeClass} ${variantClass} ${errorClass} ${className}`.trim()}
                {...props}
            />
            {/* Show password toggle */}
            {(isPasswordField && showPasswordToggle) && (
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 z-10 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={disabled}
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <svg className="h-5 w-5 text-base-content/60 hover:text-base-content/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5 text-base-content/60 hover:text-base-content/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
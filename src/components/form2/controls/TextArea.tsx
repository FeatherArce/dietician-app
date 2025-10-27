import { forwardRef } from "react";

// 文本區域組件
export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    error?: string | string[];
    size?: 'sm' | 'md' | 'lg';
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
    value = '',
    onChange,
    onBlur,
    error,
    size = 'md',
    className = '',
    ...props
}, ref) => {
    const sizeClass = {
        sm: 'textarea-sm',
        md: '',
        lg: 'textarea-lg'
    }[size];

    const errorClass = error ? 'textarea-error' : '';

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            className={`textarea textarea-bordered w-full ${sizeClass} ${errorClass} ${className}`.trim()}
            {...props}
        />
    );
});

TextArea.displayName = 'TextArea';

export default TextArea;
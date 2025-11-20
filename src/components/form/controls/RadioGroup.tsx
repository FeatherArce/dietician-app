import { forwardRef } from "react";

// 單選按鈕組組件
export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string | string[];
  options?: RadioOption[];
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(({
  value = '',
  onChange,
  onBlur,
  error,
  options = [],
  name,
  size = 'md',
  direction = 'vertical',
  ...props
}, ref) => {
  const sizeClass = {
    sm: 'radio-sm',
    md: '',
    lg: 'radio-lg'
  }[size];

  const containerClass = direction === 'horizontal' 
    ? 'flex flex-row space-x-4' 
    : 'flex flex-col space-y-2';

  return (
    <div ref={ref} className={containerClass} {...props}>
      {options.map((option) => (
        <label key={option.value} className="cursor-pointer label">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            disabled={option.disabled}
            className={`radio ${sizeClass}`.trim()}
          />
          <span className="label-text ml-2">{option.label}</span>
        </label>
      ))}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
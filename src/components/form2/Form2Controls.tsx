"use client";
import React, { forwardRef } from 'react';

// 基礎輸入框組件
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'value'> {
  value?: string | FileList;
  onChange?: (value: string | FileList) => void;
  onBlur?: () => void;
  error?: string | string[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'bordered' | 'ghost' | 'primary';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
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
    <input
      ref={ref}
      type={type}
      value={inputValue}
      onChange={handleChange}
      onBlur={onBlur}
      className={`input w-full ${sizeClass} ${variantClass} ${errorClass} ${className}`.trim()}
      {...props}
    />
  );
});

Input.displayName = 'Input';

// 文本區域組件
export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string | string[];
  size?: 'sm' | 'md' | 'lg';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
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

// 選擇框組件
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string | string[];
  options?: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  value = '',
  onChange,
  onBlur,
  error,
  options = [],
  placeholder,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const sizeClass = {
    sm: 'select-sm',
    md: '',
    lg: 'select-lg'
  }[size];

  const errorClass = error ? 'select-error' : '';

  return (
    <select
      ref={ref}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      className={`select select-bordered w-full ${sizeClass} ${errorClass} ${className}`.trim()}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
});

Select.displayName = 'Select';

// 複選框組件
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  error?: string | string[];
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  checked = false,
  onChange,
  onBlur,
  error,
  label,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const sizeClass = {
    sm: 'checkbox-sm',
    md: '',
    lg: 'checkbox-lg'
  }[size];

  const errorClass = error ? 'checkbox-error' : '';

  const checkbox = (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      onBlur={onBlur}
      className={`checkbox ${sizeClass} ${errorClass} ${className}`.trim()}
      {...props}
    />
  );

  if (label) {
    return (
      <label className="cursor-pointer label">
        {checkbox}
        <span className="label-text ml-2">{label}</span>
      </label>
    );
  }

  return checkbox;
});

Checkbox.displayName = 'Checkbox';

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

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(({
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

// 數字輸入框組件
export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'> {
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  error?: string | string[];
  size?: 'sm' | 'md' | 'lg';
  precision?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(({
  value,
  onChange,
  onBlur,
  error,
  size = 'md',
  precision,
  className = '',
  ...props
}, ref) => {
  const sizeClass = {
    sm: 'input-sm',
    md: '',
    lg: 'input-lg'
  }[size];

  const errorClass = error ? 'input-error' : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = e.target.value;
    
    // 如果輸入為空，傳遞空字串給 Form2（讓它處理驗證）
    if (stringValue === '') {
      onChange?.('' as any);
      return;
    }

    let numValue = parseFloat(stringValue);
    if (isNaN(numValue)) {
      return; // 不更新無效值
    }

    if (precision !== undefined) {
      numValue = parseFloat(numValue.toFixed(precision));
    }

    onChange?.(numValue);
  };

  return (
    <input
      ref={ref}
      type="number"
      value={value !== undefined ? value : ''}
      onChange={handleChange}
      onBlur={onBlur}
      className={`input input-bordered w-full ${sizeClass} ${errorClass} ${className}`.trim()}
      {...props}
    />
  );
});

NumberInput.displayName = 'NumberInput';
"use client";
import { forwardRef, HTMLInputTypeAttribute, useState } from "react";

export interface FormFieldProps {
  label: string;
  name: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string | React.ReactNode;
  error?: string;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  defaultValue?: string;
  className?: string;
  showPasswordToggle?: boolean; // 新增屬性
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      name,
      type = "text",
      placeholder,
      required = false,
      disabled = false,
      helpText,
      error,
      autoComplete,
      minLength,
      maxLength,
      pattern,
      defaultValue,
      className = "",
      showPasswordToggle = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const currentType = isPasswordField && showPassword ? "text" : type;

    return (
      <div className={`form-control w-full vertical ${className}`}>
        <label className="label" htmlFor={name}>
          <span className="label-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
        <div className="relative w-full">
          <input
            ref={ref}
            id={name}
            name={name}
            type={currentType}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            defaultValue={defaultValue}
            className={`input input-bordered w-full ${
              error ? "input-error" : ""
            } ${disabled ? "input-disabled" : ""} ${
              isPasswordField && showPasswordToggle ? "pr-12" : ""
            }`}
            {...props}
          />
          {isPasswordField && showPasswordToggle && (
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
        {helpText && !error && (
          <label className="label">
            <span className="label-text-alt text-base-content/70">
              {helpText}
            </span>
          </label>
        )}
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
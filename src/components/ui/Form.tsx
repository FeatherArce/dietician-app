"use client";
import { FormHTMLAttributes, ReactNode } from "react";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  isLoading?: boolean;
  submitText?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  footer?: ReactNode;
}

export function Form({
  children,
  isLoading = false,
  submitText = "提交",
  onSubmit,
  footer,
  className = "",
  ...props
}: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={className}
      noValidate
      {...props}
    >
      <fieldset disabled={isLoading} className="space-y-4">
        {children}
      </fieldset>
      
      <div className="form-control mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading && <span className="loading loading-spinner loading-xs"></span>}
          {isLoading ? "處理中..." : submitText}
        </button>
      </div>

      {footer && (
        <>
          <div className="divider">或</div>
          <div className="text-center space-y-2">{footer}</div>
        </>
      )}
    </form>
  );
}
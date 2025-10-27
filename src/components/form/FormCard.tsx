"use client";
import { FormHTMLAttributes, ReactNode } from "react";

export interface FormCardProps extends FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  submitText?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  footer?: ReactNode;
}

export function FormCard({
  title,
  subtitle,
  children,
  isLoading = false,
  submitText = "提交",
  onSubmit,
  footer,
  className = "",
  ...props
}: FormCardProps) {
  return (
    <div className="bg-base-200 flex items-center justify-center py-8">
      <div className="card w-96 bg-base-100 shadow-xl">
        <form
          onSubmit={onSubmit}
          className={`card-body ${className}`}
          noValidate
          {...props}
        >
          {title && (
            <h2 className="card-title justify-center text-2xl mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-center text-base-content/70 mb-6">
              {subtitle}
            </p>
          )}

          <fieldset disabled={isLoading} className="space-y-4">
            {children}
          </fieldset>
          
          <div className="form-control mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`btn btn-primary w-full`}
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
      </div>
    </div>
  );
}
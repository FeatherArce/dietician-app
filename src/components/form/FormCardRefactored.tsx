"use client";
import { FormHTMLAttributes, ReactNode } from "react";
import { Card } from "../ui/Card";
import { Form } from "../ui/Form";

export interface FormCardProps extends FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  submitText?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  footer?: ReactNode;
}

/**
 * FormCard - 組合 Card 和 Form 的便利組件
 * 
 * 這個組件是 Card + Form 的組合，適用於：
 * - 登入/註冊表單
 * - 簡單的設定表單
 * - 對話框中的表單
 * 
 * 如果需要更靈活的佈局，建議直接使用 Card 和 Form 組件
 */
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
    <Card title={title} subtitle={subtitle}>
      <Form
        onSubmit={onSubmit}
        isLoading={isLoading}
        submitText={submitText}
        footer={footer}
        className={className}
        {...props}
      >
        {children}
      </Form>
    </Card>
  );
}
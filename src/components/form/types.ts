import { ReactNode } from 'react';

// 表單值的類型
export type FormValues = Record<string, unknown>;

// 表單錯誤的類型
export type FormErrors = Record<string, string | string[]>;

// 表單驗證結果接口
export interface FormValidateResult {
  isValid: boolean;
  errors: FormErrors;
}

// 驗證規則類型
export interface ValidationRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: unknown, values: FormValues) => string | Promise<string>;
}

// 表單項目實例接口
export interface FormItemInstance {
  name: string | (string | number)[] | undefined;
  getValue: () => unknown;
  setValue: (value: unknown) => void;
  getError: () => string | string[] | undefined;
  setError: (error: string | string[] | undefined) => void;
  validate: () => Promise<string | undefined>;
  rules?: ValidationRule[];
}

// 表單上下文類型
export interface FormContextType {
  values: FormValues;
  errors: FormErrors;
  touched: Record<string, boolean>;
  registerField: (name: string | (string | number)[], instance: FormItemInstance) => void;
  unregisterField: (name: string | (string | number)[]) => void;
  setFieldValue: (name: string | (string | number)[], value: unknown) => void;
  setFieldError: (name: string | (string | number)[], error: string | string[] | undefined) => void;
  setFieldTouched: (name: string | (string | number)[], touched: boolean) => void;
  validateField: (name: string | (string | number)[]) => Promise<string | undefined | null>;
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void;
}

// 表單屬性接口
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  initialValues?: FormValues;
  onFinish?: (values: FormValues) => void | Promise<void>;
  onFinishFailed?: (errorInfo: { values: FormValues; errors: FormErrors }) => void;
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void;
  className?: string;
  validateTrigger?: 'onChange' | 'onBlur' | 'onSubmit';
}

export interface FormRef {
  submit: () => void;
  reset: () => void;
  validate?: () => Promise<FormValidateResult>;
  setFieldValue: (name: string | (string | number)[], value: unknown) => void;
  setFieldsValue: (newValues: FormValues) => void;
  setErrors?: (newErrors: FormErrors) => void;
}

// 表單項目屬性接口
export interface FormItemProps {
  name?: string | (string | number)[];
  label?: ReactNode;
  rules?: ValidationRule[];
  children: ReactNode;
  className?: string;
  required?: boolean;
  help?: ReactNode;
  validateTrigger?: 'onChange' | 'onBlur';
  valuePropName?: string;
  hidden?: boolean;
  isListItem?: boolean;
}
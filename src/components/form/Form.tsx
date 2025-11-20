"use client";
import React, { useState, useCallback, useRef, FormEvent, useEffect, useMemo, useImperativeHandle } from 'react';
import type { FormProps, FormValues, FormErrors, FormItemInstance, FormRef, FormValidateResult } from './types';
import { FormContext, useFormContext } from './context';
import FormItem from './FormItem';
import FormList from './FormList';
import { pathToString, setNestedValue, getNestedValue } from './utils';
import './Form.css';
import FormButton from './FormButton';

// 主要表單組件
function Form(
  {
    children,
    initialValues = {},
    onFinish,
    onFinishFailed,
    onValuesChange,
    className = '',
  }: FormProps,
  ref: React.Ref<FormRef>) {
  const formRef = useRef<HTMLFormElement>(null);
  // 使用 useMemo 來穩定 initialValues，避免不必要的重新渲染
  const stableInitialValues = useMemo(() => initialValues, [initialValues]);

  const [values, setValues] = useState<FormValues>(stableInitialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 儲存表單項目實例的引用
  const fieldInstancesRef = useRef<Map<string, FormItemInstance>>(new Map());

  // 註冊表單項目
  const registerField = useCallback((name: string | (string | number)[], instance: FormItemInstance) => {
    const nameKey = pathToString(name);
    fieldInstancesRef.current.set(nameKey, instance);
  }, []);

  // 取消註冊表單項目
  const unregisterField = useCallback((name: string | (string | number)[]) => {
    const nameKey = pathToString(name);
    fieldInstancesRef.current.delete(nameKey);
  }, []);

  // 設置字段值
  const setFieldValue = useCallback((name: string | (string | number)[], value: unknown) => {
    setValues(prev => {
      const newValues = setNestedValue(prev, name, value);

      // 觸發值變更回調
      if (onValuesChange) {
        const nameKey = pathToString(name);
        const changedValues = { [nameKey]: value };
        onValuesChange(changedValues, newValues);
      }

      return newValues;
    });
  }, [onValuesChange]);

  const setFieldsValue = useCallback((newValues: FormValues) => {
    setValues(prevValues => {
      const updatedValues = { ...prevValues, ...newValues };
      return updatedValues;
    });
  }, []);

  // 設置字段錯誤
  const setFieldError = useCallback((name: string | (string | number)[], error: string | string[] | undefined) => {
    const nameKey = pathToString(name);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error === undefined || error === '' || (Array.isArray(error) && error.length === 0)) {
        delete newErrors[nameKey];
      } else {
        newErrors[nameKey] = error;
      }
      return newErrors;
    });
  }, []);

  // 設置字段觸摸狀態
  const setFieldTouched = useCallback((name: string | (string | number)[], isTouched: boolean) => {
    const nameKey = pathToString(name);
    setTouched(prev => ({
      ...prev,
      [nameKey]: isTouched
    }));
  }, []);

  // 驗證單個字段
  const validateField = useCallback(async (name: string | (string | number)[]) => {
    const nameKey = pathToString(name);
    const instance = fieldInstancesRef.current.get(nameKey);
    if (!instance) return null;

    try {
      // 創建一個臨時的驗證函數，使用最新的表單值
      const currentValue = getNestedValue(values, name);

      // 直接進行驗證而不依賴 instance.validate()
      if (instance.rules) {
        for (const rule of instance.rules) {
          // 必填驗證
          if (rule.required && (currentValue === undefined || currentValue === null || currentValue === '')) {
            const message = rule.message || `${name} 為必填項目`;
            setFieldError(name, message);
            return message;
          }

          // 最小長度驗證
          if (rule.min !== undefined && currentValue && String(currentValue).length < rule.min) {
            const message = rule.message || `${name} 最少需要 ${rule.min} 個字符`;
            setFieldError(name, message);
            return message;
          }

          // 最大長度驗證
          if (rule.max !== undefined && currentValue && String(currentValue).length > rule.max) {
            const message = rule.message || `${name} 最多允許 ${rule.max} 個字符`;
            setFieldError(name, message);
            return message;
          }

          // 正則表達式驗證
          if (rule.pattern && currentValue && !rule.pattern.test(String(currentValue))) {
            const message = rule.message || `${name} 格式不正確`;
            setFieldError(name, message);
            return message;
          }

          // 自定義驗證器
          if (rule.validator) {
            try {
              const result = await rule.validator(currentValue, values);
              if (result) {
                setFieldError(name, result);
                return result;
              }
            } catch {
              setFieldError(name, rule.message || '驗證失敗');
              return rule.message || '驗證失敗';
            }
          }
        }
      }

      // 沒有錯誤
      setFieldError(name, undefined);
    } catch {
      setFieldError(name, '驗證過程中發生錯誤');
    }
  }, [setFieldError, values]);

  // 驗證所有字段
  const validateFields = useCallback(async (): Promise<FormValidateResult> => {
    const fieldNames = Array.from(fieldInstancesRef.current.keys());
    const fieldErrors: FormErrors = {};
    await Promise.all(fieldNames.map(async (name) => {
      const error = await validateField(name);
      if (error) {
        fieldErrors[name] = error;
      }
    }));

    setErrors(fieldErrors);
    return {
      isValid: Object.keys(fieldErrors).length === 0,
      errors: fieldErrors
    };
  }, [validateField]);

  // 處理表單提交
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    try {
      // 驗證所有字段
      const validResult = await validateFields();
      // console.log('Form valid:', validResult.isValid);

      if (validResult.isValid) {
        // 收集最新的值
        const latestValues: FormValues = {};
        fieldInstancesRef.current.forEach((instance, name) => {
          latestValues[name] = instance.getValue();
        });

        if (onFinish) {
          await onFinish(latestValues);
        }
      } else {
        onFinishFailed?.({ values, errors: validResult.errors });
      }
    } catch (error) {
      onFinishFailed?.({ values, errors });
    }
  }, [values, errors, onFinish, onFinishFailed, validateFields]);

  // 更新初始值時同步到字段
  useEffect(() => {
    console.log('Initial values changed:', stableInitialValues);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(prev => {
      // 檢查是否真的有變化，避免不必要的更新
      const hasChanges = Object.keys(stableInitialValues).some(key =>
        prev[key] !== stableInitialValues[key]
      ) || Object.keys(prev).length !== Object.keys(stableInitialValues).length;

      if (hasChanges) {
        return { ...prev, ...stableInitialValues };
      }
      return prev;
    });
  }, [stableInitialValues]);

  const contextValue = {
    values,
    errors,
    touched,
    registerField,
    unregisterField,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    onValuesChange,
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      formRef.current?.requestSubmit();
    },
    reset: () => {
      formRef.current?.reset();
      setValues(stableInitialValues);
      setErrors({});
      setTouched({});
    },
    validate: async () => {
      return await validateFields();
    },
    setFieldValue,
    setFieldsValue,
    setErrors: (newErrors: FormErrors) => {
      setErrors(newErrors);
    },
  }), [formRef, stableInitialValues, validateFields, setFieldValue, setFieldsValue, setErrors]);

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`Form ${className}`}
        noValidate
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

// 使用 forwardRef 以支持外部引用
const ForwardForm = React.forwardRef(Form);

// 將 Form 和 FormItem 組合成一個複合組件
const FormCompound = Object.assign(ForwardForm, {
  Item: FormItem,
  List: FormList,
  Button: FormButton,
  useForm: useFormContext,
});

export default FormCompound;
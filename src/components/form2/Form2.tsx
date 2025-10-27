"use client";
import React, { useState, useCallback, useRef, FormEvent, useEffect, useMemo } from 'react';
import type { Form2Props, FormValues, FormErrors, FormItemInstance } from './types';
import { FormContext, useFormContext } from './context';
import FormItem from './FormItem';
import Form2List from './Form2List';
import { pathToString, setNestedValue, getNestedValue } from './utils';
import './Form2.css';

// 主要表單組件
export function Form2({
  children,
  initialValues = {},
  onFinish,
  onFinishFailed,
  onValuesChange,
  className = '',
}: Form2Props) {
  // 使用 useMemo 來穩定 initialValues，避免不必要的重新渲染
  const stableInitialValues = useMemo(() => initialValues, [JSON.stringify(initialValues)]);
  
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
    if (!instance) return;

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
            return;
          }

          // 最小長度驗證
          if (rule.min !== undefined && currentValue && String(currentValue).length < rule.min) {
            const message = rule.message || `${name} 最少需要 ${rule.min} 個字符`;
            setFieldError(name, message);
            return;
          }

          // 最大長度驗證
          if (rule.max !== undefined && currentValue && String(currentValue).length > rule.max) {
            const message = rule.message || `${name} 最多允許 ${rule.max} 個字符`;
            setFieldError(name, message);
            return;
          }

          // 正則表達式驗證
          if (rule.pattern && currentValue && !rule.pattern.test(String(currentValue))) {
            const message = rule.message || `${name} 格式不正確`;
            setFieldError(name, message);
            return;
          }

          // 自定義驗證器
          if (rule.validator) {
            try {
              const result = await rule.validator(currentValue, values);
              if (result) {
                setFieldError(name, result);
                return;
              }
            } catch {
              setFieldError(name, rule.message || '驗證失敗');
              return;
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
  const validateAllFields = useCallback(async (): Promise<boolean> => {
    const fieldNames = Array.from(fieldInstancesRef.current.keys());

    const validationPromises = fieldNames.map(async (name) => {
      try {
        await validateField(name);
        const instance = fieldInstancesRef.current.get(name);
        const hasError = instance?.getError() !== undefined;
        return !hasError;
      } catch {
        return false;
      }
    });

    const results = await Promise.all(validationPromises);
    const isValid = results.every(result => result === true);
    return isValid;
  }, [validateField]);

  // 處理表單提交
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    try {
      // 驗證所有字段
      const isValid = await validateAllFields();

      if (isValid) {
        // 收集最新的值
        const latestValues: FormValues = {};
        fieldInstancesRef.current.forEach((instance, name) => {
          latestValues[name] = instance.getValue();
        });

        if (onFinish) {
          await onFinish(latestValues);
        }
      } else {
        // 收集錯誤信息
        const currentErrors: FormErrors = {};
        fieldInstancesRef.current.forEach((instance, name) => {
          const error = instance.getError();
          if (error) {
            currentErrors[name] = error;
          }
        });

        if (onFinishFailed) {
          onFinishFailed({ values, errors: currentErrors });
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      if (onFinishFailed) {
        onFinishFailed({ values, errors });
      }
    }
  }, [values, errors, onFinish, onFinishFailed, validateAllFields]);

  // 更新初始值時同步到字段
  useEffect(() => {
    console.log('Initial values changed:', stableInitialValues);
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

  return (
    <FormContext.Provider value={contextValue}>
      <form
        onSubmit={handleSubmit}
        className={`form2 ${className}`}
        noValidate
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

// 將 Form2 和 FormItem 組合成一個複合組件
const Form2Compound = Object.assign(Form2, {
  Item: FormItem,
  List: Form2List,
  useForm: useFormContext,
});

export default Form2Compound;
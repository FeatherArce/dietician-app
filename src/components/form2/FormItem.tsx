"use client";
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { FormItemProps, FormItemInstance, ValidationRule } from './types';
import { useFormContext } from './context';
import { pathToString, getNestedValue } from './utils';

// 表單項目組件
export default function FormItem({
    name,
    label,
    rules = [],
    children,
    className = '',
    required = false,
    help,
    validateTrigger = 'onChange',
    valuePropName = 'value',
}: FormItemProps) {
    const {
        registerField,
        unregisterField,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        errors,
        touched,
        values: formValues,
    } = useFormContext();

    const [localError, setLocalError] = useState<string | string[] | undefined>();

    // 合併 required 規則
    const mergedRules = useMemo((): ValidationRule[] => {
        return required
            ? [{ required: true, message: `${label || name} 為必填項目` }, ...rules]
            : rules;
    }, [required, rules, label, name]);

    // 獲取當前字段值的輔助函數
    const getCurrentValue = useCallback(() => {
        return getNestedValue(formValues, name);
    }, [formValues, name]);

    // 驗證函數
    const validate = useCallback(async (): Promise<string | undefined> => {
        const currentValue = getCurrentValue();
        for (const rule of mergedRules) {
            // 必填驗證
            if (rule.required && (currentValue === undefined || currentValue === null || currentValue === '')) {
                const message = rule.message || `${label || name} 為必填項目`;
                return message;
            }

            // 最小長度驗證
            if (rule.min !== undefined && currentValue && String(currentValue).length < rule.min) {
                const message = rule.message || `${label || name} 最少需要 ${rule.min} 個字符`;
                return message;
            }

            // 最大長度驗證
            if (rule.max !== undefined && currentValue && String(currentValue).length > rule.max) {
                const message = rule.message || `${label || name} 最多允許 ${rule.max} 個字符`;
                return message;
            }

            // 正則表達式驗證
            if (rule.pattern && currentValue && !rule.pattern.test(String(currentValue))) {
                const message = rule.message || `${label || name} 格式不正確`;
                return message;
            }

            // 自定義驗證器
            if (rule.validator) {
                try {
                    const result = await rule.validator(currentValue, formValues);
                    if (result) {
                        return result;
                    }
                } catch {
                    return rule.message || '驗證失敗';
                }
            }
        }

        return undefined;
    }, [getCurrentValue, mergedRules, label, name, formValues]);

    // 創建字段實例 - 使用 useMemo 穩定實例
    const fieldInstance = useMemo((): FormItemInstance => ({
        name,
        getValue: () => getNestedValue(formValues, name), // 直接從 formValues 讀取，不使用閉包
        setValue: (newValue: unknown) => setFieldValue(name, newValue),
        getError: () => localError,
        setError: (error: string | string[] | undefined) => setLocalError(error),
        validate: async () => {
            // 在驗證時重新獲取最新值
            const currentValue = getNestedValue(formValues, name);
            console.log(`Validating ${name}:`, { currentValue, formValues });

            for (const rule of mergedRules) {
                // 必填驗證
                if (rule.required && (currentValue === undefined || currentValue === null || currentValue === '')) {
                    const message = rule.message || `${label || name} 為必填項目`;
                    console.log(`Required validation failed for ${name}:`, { currentValue, message });
                    return message;
                }

                // 最小長度驗證
                if (rule.min !== undefined && currentValue && String(currentValue).length < rule.min) {
                    const message = rule.message || `${label || name} 最少需要 ${rule.min} 個字符`;
                    return message;
                }

                // 最大長度驗證
                if (rule.max !== undefined && currentValue && String(currentValue).length > rule.max) {
                    const message = rule.message || `${label || name} 最多允許 ${rule.max} 個字符`;
                    return message;
                }

                // 正則表達式驗證
                if (rule.pattern && currentValue && !rule.pattern.test(String(currentValue))) {
                    const message = rule.message || `${label || name} 格式不正確`;
                    return message;
                }

                // 自定義驗證器
                if (rule.validator) {
                    try {
                        const result = await rule.validator(currentValue, formValues);
                        if (result) {
                            return result;
                        }
                    } catch {
                        return rule.message || '驗證失敗';
                    }
                }
            }

            return undefined;
        },
        rules: mergedRules,
    }), [name, formValues, setFieldValue, localError, mergedRules, label]);

    // 註冊和取消註冊字段
    useEffect(() => {
        registerField(name, fieldInstance);
        return () => unregisterField(name);
    }, [name, registerField, unregisterField, fieldInstance]);

    // 處理值變更
    const handleValueChange = useCallback((newValue: unknown) => {
        setFieldValue(name, newValue);

        if (validateTrigger === 'onChange') {
            // 直接使用新值進行驗證，而不是等待 context 更新
            const validateWithNewValue = async () => {
                for (const rule of mergedRules) {
                    // 必填驗證
                    if (rule.required && (newValue === undefined || newValue === null || newValue === '')) {
                        const message = rule.message || `${label || name} 為必填項目`;
                        setLocalError(message);
                        setFieldError(name, message);
                        return;
                    }

                    // 最小長度驗證
                    if (rule.min !== undefined && newValue && String(newValue).length < rule.min) {
                        const message = rule.message || `${label || name} 最少需要 ${rule.min} 個字符`;
                        setLocalError(message);
                        setFieldError(name, message);
                        return;
                    }

                    // 最大長度驗證
                    if (rule.max !== undefined && newValue && String(newValue).length > rule.max) {
                        const message = rule.message || `${label || name} 最多允許 ${rule.max} 個字符`;
                        setLocalError(message);
                        setFieldError(name, message);
                        return;
                    }

                    // 正則表達式驗證
                    if (rule.pattern && newValue && !rule.pattern.test(String(newValue))) {
                        const message = rule.message || `${label || name} 格式不正確`;
                        setLocalError(message);
                        setFieldError(name, message);
                        return;
                    }

                    // 自定義驗證器
                    if (rule.validator) {
                        try {
                            const result = await rule.validator(newValue, formValues);
                            if (result) {
                                setLocalError(result);
                                setFieldError(name, result);
                                return;
                            }
                        } catch {
                            const message = rule.message || '驗證失敗';
                            setLocalError(message);
                            setFieldError(name, message);
                            return;
                        }
                    }
                }

                // 沒有錯誤
                setLocalError(undefined);
                setFieldError(name, undefined);
            };

            validateWithNewValue();
        }
    }, [name, setFieldValue, setFieldError, validateTrigger, mergedRules, label, formValues]);

    // 處理失焦事件
    const handleBlur = useCallback(() => {
        setFieldTouched(name, true);

        if (validateTrigger === 'onBlur') {
            validate().then(error => {
                setLocalError(error);
                setFieldError(name, error);
            });
        }
    }, [name, setFieldTouched, setFieldError, validate, validateTrigger]);

    // 獲取字段錯誤和觸摸狀態
    const nameKey = pathToString(name);
    const fieldError = errors[nameKey];
    const fieldTouched = touched[nameKey];
    const currentValue = getCurrentValue();

    // 克隆子元素並注入必要的 props
    const injectedProps: Record<string, any> = {
        onChange: handleValueChange,
        onBlur: handleBlur,
        error: localError || fieldError,
    };
    if (valuePropName === 'checked') {
        injectedProps.checked = !!currentValue;
    } else {
        injectedProps.value = currentValue ?? '';
    }

    // 克隆子元素並注入必要的 props
    const childElement = React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, injectedProps)
        : children;

    const showError = (fieldTouched || localError) && (localError || fieldError);
    const errorMessage = localError || fieldError;

    return (
        <div className={`form-item ${className} ${showError ? 'form-item-error' : ''}`}>
            {label && (
                <label className="form-item-label">
                    {label}
                    {required && <span className="form-item-required"> *</span>}
                </label>
            )}

            <div className="form-item-control">
                {childElement}
            </div>

            {showError && errorMessage && (
                <div className="form-item-error-message text-red-600">
                    {Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}
                </div>
            )}

            {help && !showError && (
                <div className="form-item-help">
                    {help}
                </div>
            )}
        </div>
    );
}
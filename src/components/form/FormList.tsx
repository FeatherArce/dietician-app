"use client";
import React, { useState, useCallback, useMemo } from 'react';
import { useFormContext } from './context';
import { getNestedValue, setNestedValue, pathToString } from './utils';
import type { FormValues } from './types';// 動態列表操作接口
import { cn } from '@/libs/utils';
export interface ListOperations {
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

// 動態列表字段信息
export interface ListField {
  key: number;
  name: number;
  fieldKey: number;
}

export function convertFormListValueToArray(value: any): any[] {
  if (Array.isArray(value)) {
    return value;
  } else if (value === undefined || value === null) {
    return [];
  } else {
    return [value];
  }
}

// Form.List 組件屬性
export interface FormListProps {
  name: string | (string | number)[];
  children: (fields: ListField[], operations: ListOperations, meta: { errors?: string[] }) => React.ReactNode;
  initialValue?: any[];
}

// 生成唯一 key 的計數器
let globalKeyCounter = 0;

function FormList({ name, children, initialValue = [] }: FormListProps) {
  const { values, setFieldValue, errors } = useFormContext();

  // 獲取當前列表值
  const listValue = (getNestedValue(values, name) || initialValue) as any[];

  // 為每個項目生成唯一的 key
  const [fieldKeys, setFieldKeys] = useState<number[]>(() => {
    return listValue.map((_, index) => index);
  });

  // 添加項目
  const add = useCallback((defaultValue: any = {}, insertIndex?: number) => {
    console.log('Adding item to Form.List at', name);
    const newKey = ++globalKeyCounter;
    const currentList = [...listValue];
    const currentKeys = [...fieldKeys];

    if (insertIndex !== undefined) {
      currentList.splice(insertIndex, 0, defaultValue);
      currentKeys.splice(insertIndex, 0, newKey);
    } else {
      currentList.push(defaultValue);
      currentKeys.push(newKey);
    }

    setFieldValue(name, currentList);
    setFieldKeys(currentKeys);
  }, [listValue, fieldKeys, name, setFieldValue]);

  // 移除項目
  const remove = useCallback((index: number | number[]) => {
    const indices = Array.isArray(index) ? index : [index];
    const sortedIndices = indices.sort((a, b) => b - a); // 從後往前刪除

    let currentList = [...listValue];
    let currentKeys = [...fieldKeys];

    sortedIndices.forEach(idx => {
      if (idx >= 0 && idx < currentList.length) {
        currentList.splice(idx, 1);
        currentKeys.splice(idx, 1);
      }
    });

    setFieldValue(name, currentList);
    setFieldKeys(currentKeys);
  }, [listValue, fieldKeys, name, setFieldValue]);

  // 移動項目
  const move = useCallback((from: number, to: number) => {
    if (from === to || from < 0 || to < 0 ||
      from >= listValue.length || to >= listValue.length) {
      return;
    }

    const currentList = [...listValue];
    const currentKeys = [...fieldKeys];

    // 移動列表項目
    const [movedItem] = currentList.splice(from, 1);
    currentList.splice(to, 0, movedItem);

    // 移動對應的 key
    const [movedKey] = currentKeys.splice(from, 1);
    currentKeys.splice(to, 0, movedKey);

    setFieldValue(name, currentList);
    setFieldKeys(currentKeys);
  }, [listValue, fieldKeys, name, setFieldValue]);

  // 生成字段信息
  const fields: ListField[] = listValue.map((_, index) => ({
    key: fieldKeys[index] || index,
    name: index,
    fieldKey: fieldKeys[index] || index,
  }));

  // 操作對象
  const operations: ListOperations = useMemo(() => ({ add, remove, move }), [add, remove, move]);

  // 獲取列表級別的錯誤
  const listErrors = getNestedValue(errors, name) as string[] | undefined;

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      {children(fields, operations, { errors: listErrors })}
    </ul>
  );
}

interface FormListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

function FormListItem({ className, children, ...props }: FormListItemProps) {
  return <li className={cn('list-row', className)} {...props}>{children}</li>;
}

FormList.Item = FormListItem;

export default FormList;
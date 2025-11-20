"use client";

import { createContext, useContext } from 'react';
import type { FormContextType } from './types';

// 創建表單上下文
export const FormContext = createContext<FormContextType | null>(null);

// 自定義 Hook 獲取表單上下文
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
};
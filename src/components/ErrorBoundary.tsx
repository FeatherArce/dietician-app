// ErrorBoundary.tsx
// 目標是建立一個簡單的錯誤邊界組件來捕捉子組件中的錯誤，會配合 Suspense 與 SWR 使用

"use client";
import React, { Component, ReactNode } from 'react';
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback: ReactNode;
}
interface ErrorBoundaryState {
    hasError: boolean;
}
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        // 更新狀態以顯示備援 UI
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // 在這裡記錄錯誤資訊
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // 如果發生錯誤，顯示備援 UI
            return this.props.fallback;
        }

        return this.props.children;
    }
}
'use client';
import { useTheme } from '@/hooks/useTheme';
import React, { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { initializeTheme } = useTheme();

    useEffect(() => {
        initializeTheme();
    }, [initializeTheme]);

    return (children);
}

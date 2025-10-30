// useTheme.tsx
// set theme based on localStorage value
// export getTheme and setTheme functions
import { AUTH_CONSTANTS } from '@/constants/app-constants';
import { useCallback } from 'react';

export function useTheme() {
    const getTheme = useCallback(() => {
        return localStorage.getItem(AUTH_CONSTANTS.PREFERENCE_THEME_KEY) || 'light';
    }, []);

    const setTheme = useCallback((newTheme: string) => {
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem(AUTH_CONSTANTS.PREFERENCE_THEME_KEY, newTheme);
    }, []);

    const initializeTheme = useCallback(() => {
        const savedTheme = getTheme();
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, [getTheme]);

    return { getTheme, setTheme, initializeTheme };
}
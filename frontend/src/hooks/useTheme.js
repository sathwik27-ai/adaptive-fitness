import { useState, useEffect, useCallback } from 'react';

const DARK_KEY = 'afc-theme';

export default function useTheme() {
    const [dark, setDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        const stored = localStorage.getItem(DARK_KEY);
        if (stored !== null) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(DARK_KEY, dark ? 'dark' : 'light');
    }, [dark]);

    const toggle = useCallback(() => setDark(d => !d), []);

    return { dark, toggle };
}

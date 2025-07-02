"use client";

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Wait until component is mounted to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        console.log('Current theme:', theme);
        const newTheme = theme === 'light' ? 'dark' : 'light';
        console.log('Setting new theme:', newTheme);
        setTheme(newTheme);
    };

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return <div className="w-5 h-5" />;
    }

    return (
        <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center justify-center"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5" />
            )}
        </button>
    );
}

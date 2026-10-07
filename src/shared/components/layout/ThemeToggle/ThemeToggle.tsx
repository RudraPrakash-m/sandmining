import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/config/theme';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-300 group flex items-center justify-center overflow-hidden relative"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className={`transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-12 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <Sun className="text-header-text/60 group-hover:text-primary transition-colors h-6 w-6" />
            </div>
            <div className={`absolute transition-all duration-500 transform ${theme === 'light' ? '-translate-y-12 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <Moon className="text-header-text/60 group-hover:text-primary transition-colors h-6 w-6" />
            </div>
        </button>
    );
};

export default ThemeToggle;

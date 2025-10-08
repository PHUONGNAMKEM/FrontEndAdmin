import { createContext, useContext, useEffect, useState } from "react";


type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('light');

    const applyTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        // document.documentElement.classList.toggle("dark", newTheme === "dark");
        document.documentElement.setAttribute('data-theme', newTheme);
    }

    useEffect(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        // kiểm tra hệ điều hành có dùng dark mode hay ko window.matchMedia('(perfers-color-scheme: dark)')
        // nó trả về một MediaQueryList, có thuộc tính .matches, trả về true nếu đang dùng dark mode, false
        const initialTheme = saved || system;
        applyTheme(initialTheme);
    }, []);

    const toggleTheme = () => {
        applyTheme(theme === 'light' ? 'dark' : 'light');
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
}

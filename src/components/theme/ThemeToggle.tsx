import { Button, ColorPicker } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { Moon, MoonStar, Sun } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();


    return (
        <>
            <Button
                onClick={toggleTheme}
                icon={
                    theme === "light"
                        ? <MoonStar size={18} color="var(--icon-theme-dark-mode)" />
                        : <Sun size={18} color="var(--icon-theme-dark-mode)" />
                }
                className="px-4 py-2 rounded cursor-pointer !bg-[var(--background-icon-theme-dark-mode)] dark:bg-neutral-700 dark:text-white
                !text-[var(--text-color)] hover:!text-[var(--text-color)]"
            >
                {theme === "light" ? "Dark" : "Light"}
            </Button>
        </>
    );
};

export default ThemeToggle;
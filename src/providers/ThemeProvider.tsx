import React, { useEffect, useState } from 'react';
import { ThemeContext, type Theme } from './ThemeContext';

export interface ThemeProviderProps {
    theme?: Theme;
    defaultTheme?: Theme;
    onThemeChange?: (theme: Theme) => void;
    children: React.ReactNode;
}

/**
 * `ThemeProvider` sets `data-theme` on the document root and exposes the active theme
 * via `useTheme`. Supports uncontrolled use (`defaultTheme`, in-memory state, no
 * persistence) and controlled use (`theme` + `onThemeChange`), so Storybook's toolbar
 * (or any external toggle) can drive it.
 */
export function ThemeProvider({ theme, defaultTheme = 'dark', onThemeChange, children }: ThemeProviderProps) {
    const [internalTheme, setInternalTheme] = useState<Theme>(defaultTheme);
    const activeTheme = theme ?? internalTheme;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', activeTheme);
    }, [activeTheme]);

    const setTheme = theme !== undefined
        ? (next: Theme) => onThemeChange?.(next)
        : setInternalTheme;

    return (
        <ThemeContext.Provider value={{ theme: activeTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

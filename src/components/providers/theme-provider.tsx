"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/store/preferences-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { preferences } = usePreferencesStore();

    useEffect(() => {
        const root = document.documentElement;

        // Apply theme
        const applyTheme = (theme: "light" | "dark" | "system") => {
            if (theme === "system") {
                const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                root.classList.toggle("dark", systemDark);
            } else {
                root.classList.toggle("dark", theme === "dark");
            }
        };

        applyTheme(preferences.theme);

        // Listen for system theme changes
        if (preferences.theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = (e: MediaQueryListEvent) => {
                root.classList.toggle("dark", e.matches);
            };
            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        }
    }, [preferences.theme]);

    useEffect(() => {
        // Apply accent color
        document.documentElement.style.setProperty("--color-accent", preferences.accentColor);
        document.documentElement.style.setProperty("--color-secondary", preferences.accentColor);
    }, [preferences.accentColor]);

    useEffect(() => {
        // Apply font size
        const sizes = {
            small: "14px",
            medium: "16px",
            large: "18px",
        };
        document.documentElement.style.setProperty("--base-font-size", sizes[preferences.fontSize]);
    }, [preferences.fontSize]);

    useEffect(() => {
        // Apply density
        const spacing = {
            compact: "0.75",
            normal: "1",
            comfortable: "1.25",
        };
        document.documentElement.style.setProperty("--density-multiplier", spacing[preferences.density]);
    }, [preferences.density]);

    return <>{children}</>;
}

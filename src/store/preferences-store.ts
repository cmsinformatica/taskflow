import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Preferences {
    // Aparência
    theme: "light" | "dark" | "system";
    accentColor: string;
    density: "compact" | "normal" | "comfortable";
    fontSize: "small" | "medium" | "large";

    // Quadros e Listas
    defaultSort: "date" | "priority" | "manual";
    showCardCount: boolean;
    autoArchiveDays: number | null;

    // Notificações
    pushNotifications: boolean;
    emailDigest: "daily" | "weekly" | "off";
    dueDateAlert: number; // hours before

    // Produtividade
    keyboardShortcuts: boolean;
    confirmDelete: boolean;
    cardClickAction: "modal" | "page";
    quickEdit: boolean;

    // Conta
    displayName: string;
    language: "pt-BR" | "en" | "es";
    timezone: string;

    // Privacidade
    showOnlineStatus: boolean;
}

interface PreferencesStore {
    preferences: Preferences;
    setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
    resetPreferences: () => void;
}

const defaultPreferences: Preferences = {
    // Aparência
    theme: "light",
    accentColor: "#2A9D8F",
    density: "normal",
    fontSize: "medium",

    // Quadros e Listas
    defaultSort: "manual",
    showCardCount: true,
    autoArchiveDays: null,

    // Notificações
    pushNotifications: false,
    emailDigest: "off",
    dueDateAlert: 24,

    // Produtividade
    keyboardShortcuts: true,
    confirmDelete: true,
    cardClickAction: "modal",
    quickEdit: true,

    // Conta
    displayName: "",
    language: "pt-BR",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Privacidade
    showOnlineStatus: true,
};

export const usePreferencesStore = create<PreferencesStore>()(
    persist(
        (set) => ({
            preferences: defaultPreferences,
            setPreference: (key, value) =>
                set((state) => ({
                    preferences: { ...state.preferences, [key]: value },
                })),
            resetPreferences: () => set({ preferences: defaultPreferences }),
        }),
        {
            name: "boardzen-preferences",
        }
    )
);

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    LayoutGrid,
    Palette,
    Bell,
    Zap,
    User,
    Shield,
    Check,
    Moon,
    Sun,
    Monitor,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { usePreferencesStore, Preferences } from "@/store/preferences-store";

const ACCENT_COLORS = [
    "#2A9D8F", // Teal (default)
    "#264653", // Dark blue
    "#E76F51", // Coral
    "#F4A261", // Orange
    "#E9C46A", // Yellow
    "#8ECAE6", // Light blue
    "#219EBC", // Blue
    "#606C38", // Olive
];

export default function PreferencesPage() {
    const { preferences, setPreference, resetPreferences } = usePreferencesStore();
    const [activeSection, setActiveSection] = useState("appearance");
    const [saved, setSaved] = useState(false);

    const showSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleChange = <K extends keyof Preferences>(
        key: K,
        value: Preferences[K]
    ) => {
        setPreference(key, value);
        showSaved();
    };

    const sections = [
        { id: "appearance", label: "Aparência", icon: Palette },
        { id: "notifications", label: "Notificações", icon: Bell },
        { id: "productivity", label: "Produtividade", icon: Zap },
        { id: "account", label: "Conta", icon: User },
        { id: "privacy", label: "Privacidade", icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-[#F5F7F8]">
            {/* Header */}
            <header className="bg-white border-b border-[#E0E0E0] px-4 sm:px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-xl hover:bg-[#F5F7F8] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#264653]" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#264653] flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-[#264653]">Preferências</h1>
                            <p className="text-sm text-[#6B7280]">Personalize sua experiência</p>
                        </div>
                    </div>
                    {saved && (
                        <div className="ml-auto flex items-center gap-2 text-[#2A9D8F] text-sm animate-fade-in">
                            <Check className="w-4 h-4" />
                            Salvo
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <nav className="lg:w-56 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-2 border border-[#E0E0E0]">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeSection === section.id
                                            ? "bg-[#264653]/5 text-[#264653] font-medium"
                                            : "text-[#6B7280] hover:bg-[#F5F7F8]"
                                        }`}
                                >
                                    <section.icon className="w-5 h-5" />
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0]">
                            {/* Aparência */}
                            {activeSection === "appearance" && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#264653] mb-1">Aparência</h2>
                                        <p className="text-sm text-[#6B7280]">Personalize o visual do Boardzen</p>
                                    </div>

                                    {/* Theme */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#2B2B2B] mb-3">
                                            Tema
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { value: "light", label: "Claro", icon: Sun },
                                                { value: "dark", label: "Escuro", icon: Moon },
                                                { value: "system", label: "Sistema", icon: Monitor },
                                            ].map((theme) => (
                                                <button
                                                    key={theme.value}
                                                    onClick={() => handleChange("theme", theme.value as Preferences["theme"])}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${preferences.theme === theme.value
                                                            ? "border-[#2A9D8F] bg-[#2A9D8F]/5"
                                                            : "border-[#E0E0E0] hover:border-[#2A9D8F]/50"
                                                        }`}
                                                >
                                                    <theme.icon className="w-6 h-6 text-[#264653]" />
                                                    <span className="text-sm text-[#2B2B2B]">{theme.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Accent Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#2B2B2B] mb-3">
                                            Cor de destaque
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {ACCENT_COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => handleChange("accentColor", color)}
                                                    className={`w-10 h-10 rounded-xl transition-all ${preferences.accentColor === color
                                                            ? "ring-2 ring-offset-2 ring-[#264653] scale-110"
                                                            : "hover:scale-105"
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Density */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#2B2B2B] mb-3">
                                            Densidade
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { value: "compact", label: "Compacto" },
                                                { value: "normal", label: "Normal" },
                                                { value: "comfortable", label: "Confortável" },
                                            ].map((d) => (
                                                <button
                                                    key={d.value}
                                                    onClick={() => handleChange("density", d.value as Preferences["density"])}
                                                    className={`px-4 py-2 rounded-xl border-2 text-sm transition-all ${preferences.density === d.value
                                                            ? "border-[#2A9D8F] bg-[#2A9D8F]/5 text-[#2A9D8F]"
                                                            : "border-[#E0E0E0] text-[#6B7280] hover:border-[#2A9D8F]/50"
                                                        }`}
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Font Size */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#2B2B2B] mb-3">
                                            Tamanho da fonte
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { value: "small", label: "Pequeno" },
                                                { value: "medium", label: "Médio" },
                                                { value: "large", label: "Grande" },
                                            ].map((f) => (
                                                <button
                                                    key={f.value}
                                                    onClick={() => handleChange("fontSize", f.value as Preferences["fontSize"])}
                                                    className={`px-4 py-2 rounded-xl border-2 text-sm transition-all ${preferences.fontSize === f.value
                                                            ? "border-[#2A9D8F] bg-[#2A9D8F]/5 text-[#2A9D8F]"
                                                            : "border-[#E0E0E0] text-[#6B7280] hover:border-[#2A9D8F]/50"
                                                        }`}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notificações */}
                            {activeSection === "notifications" && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#264653] mb-1">Notificações</h2>
                                        <p className="text-sm text-[#6B7280]">Configure como receber avisos</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Push Notifications */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-[#2B2B2B]">Notificações push</p>
                                                <p className="text-sm text-[#6B7280]">Receber avisos no navegador</p>
                                            </div>
                                            <button
                                                onClick={() => handleChange("pushNotifications", !preferences.pushNotifications)}
                                                className={`w-12 h-7 rounded-full transition-colors ${preferences.pushNotifications ? "bg-[#2A9D8F]" : "bg-[#E0E0E0]"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-1 ${preferences.pushNotifications ? "translate-x-5" : "translate-x-0"
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Email Digest */}
                                        <div>
                                            <p className="font-medium text-[#2B2B2B] mb-2">Resumo por email</p>
                                            <div className="flex flex-wrap gap-3">
                                                {[
                                                    { value: "daily", label: "Diário" },
                                                    { value: "weekly", label: "Semanal" },
                                                    { value: "off", label: "Desativado" },
                                                ].map((e) => (
                                                    <button
                                                        key={e.value}
                                                        onClick={() => handleChange("emailDigest", e.value as Preferences["emailDigest"])}
                                                        className={`px-4 py-2 rounded-xl border-2 text-sm transition-all ${preferences.emailDigest === e.value
                                                                ? "border-[#2A9D8F] bg-[#2A9D8F]/5 text-[#2A9D8F]"
                                                                : "border-[#E0E0E0] text-[#6B7280] hover:border-[#2A9D8F]/50"
                                                            }`}
                                                    >
                                                        {e.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Due Date Alert */}
                                        <div>
                                            <p className="font-medium text-[#2B2B2B] mb-2">Alerta de prazo</p>
                                            <p className="text-sm text-[#6B7280] mb-3">
                                                Avisar antes do vencimento
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                {[1, 6, 12, 24, 48].map((hours) => (
                                                    <button
                                                        key={hours}
                                                        onClick={() => handleChange("dueDateAlert", hours)}
                                                        className={`px-4 py-2 rounded-xl border-2 text-sm transition-all ${preferences.dueDateAlert === hours
                                                                ? "border-[#2A9D8F] bg-[#2A9D8F]/5 text-[#2A9D8F]"
                                                                : "border-[#E0E0E0] text-[#6B7280] hover:border-[#2A9D8F]/50"
                                                            }`}
                                                    >
                                                        {hours}h antes
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Produtividade */}
                            {activeSection === "productivity" && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#264653] mb-1">Produtividade</h2>
                                        <p className="text-sm text-[#6B7280]">Otimize seu fluxo de trabalho</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Keyboard Shortcuts */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-[#2B2B2B]">Atalhos de teclado</p>
                                                <p className="text-sm text-[#6B7280]">Usar atalhos para ações rápidas</p>
                                            </div>
                                            <button
                                                onClick={() => handleChange("keyboardShortcuts", !preferences.keyboardShortcuts)}
                                                className={`w-12 h-7 rounded-full transition-colors ${preferences.keyboardShortcuts ? "bg-[#2A9D8F]" : "bg-[#E0E0E0]"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-1 ${preferences.keyboardShortcuts ? "translate-x-5" : "translate-x-0"
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Confirm Delete */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-[#2B2B2B]">Confirmar exclusão</p>
                                                <p className="text-sm text-[#6B7280]">Pedir confirmação ao excluir</p>
                                            </div>
                                            <button
                                                onClick={() => handleChange("confirmDelete", !preferences.confirmDelete)}
                                                className={`w-12 h-7 rounded-full transition-colors ${preferences.confirmDelete ? "bg-[#2A9D8F]" : "bg-[#E0E0E0]"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-1 ${preferences.confirmDelete ? "translate-x-5" : "translate-x-0"
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Quick Edit */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-[#2B2B2B]">Edição rápida</p>
                                                <p className="text-sm text-[#6B7280]">Clicar no título para editar</p>
                                            </div>
                                            <button
                                                onClick={() => handleChange("quickEdit", !preferences.quickEdit)}
                                                className={`w-12 h-7 rounded-full transition-colors ${preferences.quickEdit ? "bg-[#2A9D8F]" : "bg-[#E0E0E0]"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-1 ${preferences.quickEdit ? "translate-x-5" : "translate-x-0"
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Card Click Action */}
                                        <div>
                                            <p className="font-medium text-[#2B2B2B] mb-2">Ao clicar no cartão</p>
                                            <div className="flex flex-wrap gap-3">
                                                {[
                                                    { value: "modal", label: "Abrir modal" },
                                                    { value: "page", label: "Abrir página" },
                                                ].map((a) => (
                                                    <button
                                                        key={a.value}
                                                        onClick={() => handleChange("cardClickAction", a.value as Preferences["cardClickAction"])}
                                                        className={`px-4 py-2 rounded-xl border-2 text-sm transition-all ${preferences.cardClickAction === a.value
                                                                ? "border-[#2A9D8F] bg-[#2A9D8F]/5 text-[#2A9D8F]"
                                                                : "border-[#E0E0E0] text-[#6B7280] hover:border-[#2A9D8F]/50"
                                                            }`}
                                                    >
                                                        {a.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Conta */}
                            {activeSection === "account" && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#264653] mb-1">Conta</h2>
                                        <p className="text-sm text-[#6B7280]">Gerencie suas informações</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Display Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                                Nome de exibição
                                            </label>
                                            <Input
                                                value={preferences.displayName}
                                                onChange={(e) => handleChange("displayName", e.target.value)}
                                                placeholder="Seu nome"
                                                className="max-w-md border-[#E0E0E0] rounded-xl"
                                            />
                                        </div>

                                        {/* Language */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#2B2B2B] mb-3">
                                                Idioma
                                            </label>
                                            <div className="flex flex-wrap gap-3">
                                                {[
                                                    { value: "pt-BR", label: "Português" },
                                                    { value: "en", label: "English" },
                                                    { value: "es", label: "Español" },
                                                ].map((l) => (
                                                    <button
                                                        key={l.value}
                                                        onClick={() => handleChange("language", l.value as Preferences["language"])}
                                                        className={`px-4 py-2 rounded-xl border-2 text-sm transition-all ${preferences.language === l.value
                                                                ? "border-[#2A9D8F] bg-[#2A9D8F]/5 text-[#2A9D8F]"
                                                                : "border-[#E0E0E0] text-[#6B7280] hover:border-[#2A9D8F]/50"
                                                            }`}
                                                    >
                                                        {l.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Timezone */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                                Fuso horário
                                            </label>
                                            <p className="text-[#6B7280] bg-[#F5F7F8] px-4 py-3 rounded-xl">
                                                {preferences.timezone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacidade */}
                            {activeSection === "privacy" && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#264653] mb-1">Privacidade</h2>
                                        <p className="text-sm text-[#6B7280]">Controle seus dados</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Show Online Status */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-[#2B2B2B]">Mostrar status online</p>
                                                <p className="text-sm text-[#6B7280]">Outros usuários podem ver quando você está online</p>
                                            </div>
                                            <button
                                                onClick={() => handleChange("showOnlineStatus", !preferences.showOnlineStatus)}
                                                className={`w-12 h-7 rounded-full transition-colors ${preferences.showOnlineStatus ? "bg-[#2A9D8F]" : "bg-[#E0E0E0]"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-1 ${preferences.showOnlineStatus ? "translate-x-5" : "translate-x-0"
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Export Data */}
                                        <div className="pt-4 border-t border-[#E0E0E0]">
                                            <p className="font-medium text-[#2B2B2B] mb-2">Exportar dados</p>
                                            <p className="text-sm text-[#6B7280] mb-4">
                                                Baixe todos os seus dados em formato JSON
                                            </p>
                                            <Button variant="outline" className="border-[#E0E0E0] rounded-xl">
                                                Exportar meus dados
                                            </Button>
                                        </div>

                                        {/* Reset Preferences */}
                                        <div className="pt-4 border-t border-[#E0E0E0]">
                                            <p className="font-medium text-[#2B2B2B] mb-2">Restaurar padrões</p>
                                            <p className="text-sm text-[#6B7280] mb-4">
                                                Voltar todas as preferências ao padrão
                                            </p>
                                            <Button
                                                variant="outline"
                                                className="border-[#E76F51] text-[#E76F51] hover:bg-[#E76F51]/5 rounded-xl"
                                                onClick={() => {
                                                    resetPreferences();
                                                    showSaved();
                                                }}
                                            >
                                                Restaurar padrões
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

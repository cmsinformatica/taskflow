"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    CheckSquare,
    Code,
} from "lucide-react";

interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const COMMANDS = [
    { trigger: "/titulo", label: "Título", icon: Heading1, markdown: "# " },
    { trigger: "/subtitulo", label: "Subtítulo", icon: Heading2, markdown: "## " },
    { trigger: "/lista", label: "Lista", icon: List, markdown: "- " },
    { trigger: "/numero", label: "Lista numerada", icon: ListOrdered, markdown: "1. " },
    { trigger: "/check", label: "Checklist", icon: CheckSquare, markdown: "- [ ] " },
    { trigger: "/codigo", label: "Código", icon: Code, markdown: "```\n" },
];

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
    const [showCommands, setShowCommands] = useState(false);
    const [commandFilter, setCommandFilter] = useState("");
    const [commandIndex, setCommandIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const filteredCommands = COMMANDS.filter((cmd) =>
        cmd.trigger.toLowerCase().includes(commandFilter.toLowerCase())
    );

    useEffect(() => {
        if (showCommands) {
            setCommandIndex(0);
        }
    }, [showCommands, commandFilter]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        onChange(text);

        // Check for / command
        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = text.slice(0, cursorPos);
        const lastSlash = textBeforeCursor.lastIndexOf("/");

        if (lastSlash !== -1) {
            const afterSlash = textBeforeCursor.slice(lastSlash);
            if (!afterSlash.includes(" ") && !afterSlash.includes("\n")) {
                setShowCommands(true);
                setCommandFilter(afterSlash);
                return;
            }
        }
        setShowCommands(false);
    };

    const insertCommand = (markdown: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPos);
        const lastSlash = textBeforeCursor.lastIndexOf("/");

        const newText =
            value.slice(0, lastSlash) + markdown + value.slice(cursorPos);

        onChange(newText);
        setShowCommands(false);

        // Focus and set cursor
        setTimeout(() => {
            const newPos = lastSlash + markdown.length;
            textarea.focus();
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showCommands) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setCommandIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setCommandIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && filteredCommands.length > 0) {
            e.preventDefault();
            insertCommand(filteredCommands[commandIndex].markdown);
        } else if (e.key === "Escape") {
            setShowCommands(false);
        }
    };

    const insertFormat = (prefix: string, suffix: string = prefix) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.slice(start, end);

        const newText =
            value.slice(0, start) + prefix + selectedText + suffix + value.slice(end);

        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            if (selectedText) {
                textarea.setSelectionRange(start + prefix.length, end + prefix.length);
            } else {
                textarea.setSelectionRange(
                    start + prefix.length,
                    start + prefix.length
                );
            }
        }, 0);
    };

    return (
        <div className="relative">
            {/* Toolbar */}
            <div className="flex items-center gap-1 mb-2 p-1 bg-[#F5F7F8] dark:bg-[#0f172a] rounded-xl">
                <button
                    type="button"
                    onClick={() => insertFormat("**")}
                    className="p-2 rounded-lg hover:bg-[#E0E0E0] dark:hover:bg-[#334155] transition-colors"
                    title="Negrito"
                >
                    <Bold className="w-4 h-4 text-[#6B7280]" />
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat("*")}
                    className="p-2 rounded-lg hover:bg-[#E0E0E0] dark:hover:bg-[#334155] transition-colors"
                    title="Itálico"
                >
                    <Italic className="w-4 h-4 text-[#6B7280]" />
                </button>
                <div className="w-px h-5 bg-[#E0E0E0] dark:bg-[#334155] mx-1" />
                <button
                    type="button"
                    onClick={() => insertFormat("# ", "")}
                    className="p-2 rounded-lg hover:bg-[#E0E0E0] dark:hover:bg-[#334155] transition-colors"
                    title="Título"
                >
                    <Heading1 className="w-4 h-4 text-[#6B7280]" />
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat("- ", "")}
                    className="p-2 rounded-lg hover:bg-[#E0E0E0] dark:hover:bg-[#334155] transition-colors"
                    title="Lista"
                >
                    <List className="w-4 h-4 text-[#6B7280]" />
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat("- [ ] ", "")}
                    className="p-2 rounded-lg hover:bg-[#E0E0E0] dark:hover:bg-[#334155] transition-colors"
                    title="Checklist"
                >
                    <CheckSquare className="w-4 h-4 text-[#6B7280]" />
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat("`")}
                    className="p-2 rounded-lg hover:bg-[#E0E0E0] dark:hover:bg-[#334155] transition-colors"
                    title="Código"
                >
                    <Code className="w-4 h-4 text-[#6B7280]" />
                </button>
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'Digite "/" para ver comandos...'}
                className="w-full p-4 rounded-xl border border-[#E0E0E0] dark:border-[#334155] bg-white dark:bg-[#0f172a] text-[#2B2B2B] dark:text-white placeholder:text-[#6B7280] focus:border-[#2A9D8F] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/20 resize-none min-h-[150px] font-mono text-sm transition-all"
                rows={6}
            />

            {/* Command Palette */}
            {showCommands && filteredCommands.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-[#E0E0E0] dark:border-[#334155] py-2 z-20 animate-fade-in max-h-[200px] overflow-y-auto">
                    {filteredCommands.map((cmd, index) => (
                        <button
                            key={cmd.trigger}
                            onClick={() => insertCommand(cmd.markdown)}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${index === commandIndex
                                    ? "bg-[#2A9D8F]/10 text-[#2A9D8F]"
                                    : "text-[#2B2B2B] dark:text-white hover:bg-[#F5F7F8] dark:hover:bg-[#334155]"
                                }`}
                        >
                            <cmd.icon className="w-4 h-4" />
                            <span className="flex-1">{cmd.label}</span>
                            <span className="text-xs text-[#6B7280]">{cmd.trigger}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Helper text */}
            <p className="text-xs text-[#6B7280] mt-2">
                💡 Digite <code className="px-1 py-0.5 bg-[#F5F7F8] dark:bg-[#334155] rounded">/</code> para comandos rápidos
            </p>
        </div>
    );
}

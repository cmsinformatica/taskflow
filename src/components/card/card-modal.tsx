"use client";

import { useState, useEffect } from "react";
import { useBoardStore } from "@/store/board-store";
import { Modal, Button, Input } from "@/components/ui";
import { RichEditor } from "./rich-editor";
import { RecurringSelector } from "./recurring-selector";
import { PomodoroTimer } from "./pomodoro-timer";
import { Label, Checklist, ChecklistItem } from "@/types";
import {
    X,
    AlignLeft,
    Calendar,
    Tag,
    CheckSquare,
    MessageSquare,
    User,
    Trash2,
    Plus,
    Repeat,
    Timer,
    Focus,
} from "lucide-react";

const LABEL_COLORS = [
    "#2A9D8F",
    "#264653",
    "#E9C46A",
    "#F4A261",
    "#E76F51",
    "#8ECAE6",
    "#219EBC",
    "#606C38",
];

export function CardModal() {
    const {
        selectedCard,
        isCardModalOpen,
        setCardModalOpen,
        setSelectedCard,
        updateCard,
        deleteCard,
        lists,
        setFocusMode,
        startTimer,
        stopTimer,
    } = useBoardStore();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Panel states
    const [showLabels, setShowLabels] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);
    const [showDueDate, setShowDueDate] = useState(false);
    const [showRecurring, setShowRecurring] = useState(false);

    // New data states
    const [newLabelName, setNewLabelName] = useState("");
    const [selectedLabelColor, setSelectedLabelColor] = useState(LABEL_COLORS[0]);
    const [newChecklistTitle, setNewChecklistTitle] = useState("");
    const [newItemTitle, setNewItemTitle] = useState("");
    const [addingItemToChecklist, setAddingItemToChecklist] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState("");
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (selectedCard) {
            setTitle(selectedCard.title);
            setDescription(selectedCard.description || "");
            setDueDate(selectedCard.due_date || "");
            // Reset panel states when switching cards
            setShowLabels(false);
            setShowChecklist(false);
            setShowDueDate(false);
            setAddingItemToChecklist(null);
        }
    }, [selectedCard?.id]); // Use id as key to properly reset when switching cards

    if (!selectedCard) return null;

    const currentList = lists.find((l) => l.id === selectedCard.list_id);

    const handleClose = () => {
        setCardModalOpen(false);
        setSelectedCard(null);
        setShowLabels(false);
        setShowChecklist(false);
        setShowDueDate(false);
    };

    const handleSaveTitle = async () => {
        if (title.trim()) {
            updateCard(selectedCard.list_id, selectedCard.id, { title: title.trim() });

            // Sync to database if authenticated
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { updateCard: dbUpdateCard } = await import("@/lib/supabase/database");
                await dbUpdateCard(selectedCard.id, { title: title.trim() });
            }
        }
        setIsEditingTitle(false);
    };

    const handleSaveDescription = async (newDesc: string) => {
        setDescription(newDesc);
        updateCard(selectedCard.list_id, selectedCard.id, { description: newDesc });

        // Sync to database if authenticated
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { updateCard: dbUpdateCard } = await import("@/lib/supabase/database");
            await dbUpdateCard(selectedCard.id, { description: newDesc });
        }
    };

    const handleDelete = async () => {
        if (confirm("Tem certeza que deseja excluir este card?")) {
            deleteCard(selectedCard.list_id, selectedCard.id);

            // Sync to database if authenticated
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { deleteCard: dbDeleteCard } = await import("@/lib/supabase/database");
                await dbDeleteCard(selectedCard.id);
            }

            handleClose();
        }
    };

    const handleFocusMode = () => {
        handleClose();
        setTimeout(() => {
            setFocusMode(selectedCard.id, selectedCard.list_id);
        }, 100);
    };

    // Labels
    const handleAddLabel = async () => {
        if (!newLabelName.trim()) return;

        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let newLabel: Label;

        if (user && currentList) {
            // Get board_id from list
            const { data: listData } = await supabase
                .from("lists")
                .select("board_id")
                .eq("id", currentList.id)
                .single();

            if (listData?.board_id) {
                // Create label in database
                const { createLabel, addLabelToCard } = await import("@/lib/supabase/database");
                const dbLabel = await createLabel(listData.board_id, newLabelName.trim(), selectedLabelColor);

                if (dbLabel) {
                    newLabel = dbLabel;
                    await addLabelToCard(selectedCard.id, dbLabel.id);
                } else {
                    return;
                }
            } else {
                return;
            }
        } else {
            newLabel = {
                id: crypto.randomUUID(),
                board_id: "",
                name: newLabelName.trim(),
                color: selectedLabelColor,
            };
        }

        const labels = [...(selectedCard.labels || []), newLabel];
        updateCard(selectedCard.list_id, selectedCard.id, { labels });
        setNewLabelName("");
        setShowLabels(false);
    };

    const handleRemoveLabel = async (labelId: string) => {
        const labels = selectedCard.labels?.filter((l) => l.id !== labelId) || [];
        updateCard(selectedCard.list_id, selectedCard.id, { labels });

        // Sync to database if authenticated
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { removeLabelFromCard } = await import("@/lib/supabase/database");
            await removeLabelFromCard(selectedCard.id, labelId);
        }
    };

    // Checklists
    const handleAddChecklist = async () => {
        if (!newChecklistTitle.trim()) return;

        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let newChecklist: Checklist;

        if (user) {
            const { createChecklist } = await import("@/lib/supabase/database");
            const dbChecklist = await createChecklist(
                selectedCard.id,
                newChecklistTitle.trim(),
                (selectedCard.checklists?.length || 0) + 1
            );

            if (dbChecklist) {
                newChecklist = dbChecklist;
            } else {
                return;
            }
        } else {
            newChecklist = {
                id: crypto.randomUUID(),
                card_id: selectedCard.id,
                title: newChecklistTitle.trim(),
                position: (selectedCard.checklists?.length || 0) + 1,
                items: [],
            };
        }

        const checklists = [...(selectedCard.checklists || []), newChecklist];
        updateCard(selectedCard.list_id, selectedCard.id, { checklists });
        setNewChecklistTitle("");
        setShowChecklist(false);
    };

    const handleAddChecklistItem = async (checklistId: string) => {
        if (!newItemTitle.trim()) return;

        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let newItem: ChecklistItem;

        if (user) {
            const { createChecklistItem } = await import("@/lib/supabase/database");
            const checklist = selectedCard.checklists?.find(cl => cl.id === checklistId);
            const position = (checklist?.items?.length || 0) + 1;
            const dbItem = await createChecklistItem(checklistId, newItemTitle.trim(), position);

            if (dbItem) {
                newItem = dbItem;
            } else {
                return;
            }
        } else {
            newItem = {
                id: crypto.randomUUID(),
                checklist_id: checklistId,
                title: newItemTitle.trim(),
                is_completed: false,
                position: 0,
            };
        }

        const checklists = selectedCard.checklists?.map((cl) =>
            cl.id === checklistId
                ? { ...cl, items: [...(cl.items || []), newItem] }
                : cl
        );
        updateCard(selectedCard.list_id, selectedCard.id, { checklists });
        setNewItemTitle("");
        setAddingItemToChecklist(null);
    };

    const handleToggleItem = async (checklistId: string, itemId: string) => {
        const checklist = selectedCard.checklists?.find(cl => cl.id === checklistId);
        const item = checklist?.items?.find(i => i.id === itemId);
        const newValue = !item?.is_completed;

        const checklists = selectedCard.checklists?.map((cl) =>
            cl.id === checklistId
                ? {
                    ...cl,
                    items: cl.items?.map((item) =>
                        item.id === itemId
                            ? { ...item, is_completed: newValue }
                            : item
                    ),
                }
                : cl
        );
        updateCard(selectedCard.list_id, selectedCard.id, { checklists });

        // Sync to database if authenticated
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { updateChecklistItem } = await import("@/lib/supabase/database");
            await updateChecklistItem(itemId, newValue);
        }
    };

    const handleDeleteChecklist = async (checklistId: string) => {
        const checklists = selectedCard.checklists?.filter((cl) => cl.id !== checklistId);
        updateCard(selectedCard.list_id, selectedCard.id, { checklists });

        // Sync to database if authenticated
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { deleteChecklist } = await import("@/lib/supabase/database");
            await deleteChecklist(checklistId);
        }
    };

    // Due Date
    const handleSaveDueDate = async () => {
        updateCard(selectedCard.list_id, selectedCard.id, { due_date: dueDate || undefined });

        // Sync to database if authenticated
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { updateCard: dbUpdateCard } = await import("@/lib/supabase/database");
            await dbUpdateCard(selectedCard.id, { due_date: dueDate || undefined });
        }

        setShowDueDate(false);
    };

    // Comments
    const handleAddComment = async () => {
        if (!comment.trim()) return;

        // Sync to database if authenticated
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const newComment = {
            id: crypto.randomUUID(),
            card_id: selectedCard.id,
            user_id: user?.id || "",
            content: comment.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        if (user) {
            const { createComment } = await import("@/lib/supabase/database");
            await createComment(selectedCard.id, comment.trim());
        }

        const comments = [...(selectedCard.comments || []), newComment];
        updateCard(selectedCard.list_id, selectedCard.id, { comments });
        setComment("");
    };

    const handlePomodoroComplete = () => {
        const currentCount = selectedCard.timer?.pomodoroCount || 0;
        updateCard(selectedCard.list_id, selectedCard.id, {
            timer: {
                ...selectedCard.timer,
                pomodoroCount: currentCount + 1,
                isRunning: false,
                totalSeconds: (selectedCard.timer?.totalSeconds || 0) + 25 * 60,
            },
        });
    };

    return (
        <Modal isOpen={isCardModalOpen} onClose={handleClose} size="lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        {isEditingTitle ? (
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleSaveTitle}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                                className="text-xl font-semibold"
                                autoFocus
                            />
                        ) : (
                            <h2
                                onClick={() => setIsEditingTitle(true)}
                                className="text-xl font-semibold text-[#264653] dark:text-white cursor-pointer hover:bg-[#F5F7F8] dark:hover:bg-[#334155] px-2 py-1 rounded-lg -ml-2"
                            >
                                {selectedCard.title}
                            </h2>
                        )}
                        <p className="text-sm text-[#6B7280] mt-1">
                            na lista <span className="font-medium">{currentList?.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-[#F5F7F8] dark:hover:bg-[#334155]"
                    >
                        <X className="w-5 h-5 text-[#6B7280]" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Labels */}
                        {selectedCard.labels && selectedCard.labels.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-[#264653] dark:text-white mb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Etiquetas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCard.labels.map((label) => (
                                        <span
                                            key={label.id}
                                            onClick={() => handleRemoveLabel(label.id)}
                                            className="px-3 py-1 rounded-full text-sm font-medium text-white cursor-pointer hover:opacity-80 transition-opacity"
                                            style={{ backgroundColor: label.color }}
                                            title="Clique para remover"
                                        >
                                            {label.name || "Sem nome"}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Due Date Display */}
                        {selectedCard.due_date && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-[#2A9D8F]" />
                                <span className="text-[#264653] dark:text-white">
                                    Entrega: {new Date(selectedCard.due_date).toLocaleDateString("pt-BR")}
                                </span>
                            </div>
                        )}

                        {/* Description with Rich Editor */}
                        <div>
                            <h3 className="text-sm font-medium text-[#264653] dark:text-white mb-2 flex items-center gap-2">
                                <AlignLeft className="w-4 h-4" />
                                Descrição
                            </h3>
                            <RichEditor
                                value={description}
                                onChange={handleSaveDescription}
                                placeholder="Adicione uma descrição detalhada..."
                            />
                        </div>

                        {/* Checklists */}
                        {selectedCard.checklists && selectedCard.checklists.length > 0 && (
                            <div className="space-y-4">
                                {selectedCard.checklists.map((checklist) => {
                                    const total = checklist.items?.length || 0;
                                    const completed = checklist.items?.filter((i) => i.is_completed).length || 0;
                                    const progress = total > 0 ? (completed / total) * 100 : 0;

                                    return (
                                        <div key={checklist.id} className="bg-[#F5F7F8] dark:bg-[#0f172a] rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-[#264653] dark:text-white flex items-center gap-2">
                                                    <CheckSquare className="w-4 h-4 text-[#2A9D8F]" />
                                                    {checklist.title}
                                                </h4>
                                                <button
                                                    onClick={() => handleDeleteChecklist(checklist.id)}
                                                    className="text-xs text-[#6B7280] hover:text-[#E76F51] transition-colors"
                                                >
                                                    Excluir
                                                </button>
                                            </div>

                                            {/* Progress */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex-1 h-2 bg-[#E0E0E0] dark:bg-[#334155] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#2A9D8F] transition-all duration-300 rounded-full"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-[#6B7280]">{Math.round(progress)}%</span>
                                            </div>

                                            {/* Items */}
                                            <div className="space-y-2">
                                                {checklist.items?.map((item) => (
                                                    <label
                                                        key={item.id}
                                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-[#1e293b] cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={item.is_completed}
                                                            onChange={() => handleToggleItem(checklist.id, item.id)}
                                                            className="w-4 h-4 rounded border-[#E0E0E0] text-[#2A9D8F] focus:ring-[#2A9D8F]"
                                                        />
                                                        <span
                                                            className={
                                                                item.is_completed
                                                                    ? "line-through text-[#6B7280]"
                                                                    : "text-[#2B2B2B] dark:text-white"
                                                            }
                                                        >
                                                            {item.title}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>

                                            {/* Add Item */}
                                            {addingItemToChecklist === checklist.id ? (
                                                <div className="mt-3 flex gap-2">
                                                    <Input
                                                        value={newItemTitle}
                                                        onChange={(e) => setNewItemTitle(e.target.value)}
                                                        placeholder="Novo item..."
                                                        className="flex-1 text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === "Enter" && handleAddChecklistItem(checklist.id)}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAddChecklistItem(checklist.id)}
                                                        className="bg-[#2A9D8F] hover:bg-[#238b80] rounded-lg"
                                                    >
                                                        Adicionar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setAddingItemToChecklist(null)}
                                                        className="rounded-lg"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setAddingItemToChecklist(checklist.id)}
                                                    className="mt-3 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#2A9D8F] transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Adicionar item
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Comments */}
                        <div>
                            <h3 className="text-sm font-medium text-[#264653] dark:text-white mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Comentários
                            </h3>

                            {/* Existing comments */}
                            {selectedCard.comments && selectedCard.comments.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {selectedCard.comments.map((c) => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#2A9D8F] flex items-center justify-center text-white text-sm font-medium shrink-0">
                                                U
                                            </div>
                                            <div className="flex-1 bg-[#F5F7F8] dark:bg-[#0f172a] rounded-xl p-3">
                                                <p className="text-sm text-[#2B2B2B] dark:text-white">{c.content}</p>
                                                <p className="text-xs text-[#6B7280] mt-1">
                                                    {new Date(c.created_at).toLocaleString("pt-BR")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New comment */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#264653] flex items-center justify-center text-white text-sm font-medium shrink-0">
                                    U
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <Input
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Escreva um comentário..."
                                        className="flex-1"
                                        onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                    />
                                    <Button
                                        onClick={handleAddComment}
                                        size="sm"
                                        className="bg-[#2A9D8F] hover:bg-[#238b80] rounded-lg"
                                    >
                                        Enviar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-[#264653] dark:text-white mb-3">
                            Adicionar ao card
                        </h3>

                        {/* Labels Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLabels(!showLabels)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F7F8] dark:bg-[#334155] hover:bg-[#E0E0E0] dark:hover:bg-[#475569] text-sm text-[#264653] dark:text-white transition-colors"
                            >
                                <Tag className="w-4 h-4" />
                                Etiquetas
                            </button>
                            {showLabels && (
                                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-[#E0E0E0] dark:border-[#334155] p-4 z-10 animate-fade-in">
                                    <Input
                                        value={newLabelName}
                                        onChange={(e) => setNewLabelName(e.target.value)}
                                        placeholder="Nome da etiqueta"
                                        className="mb-3"
                                    />
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {LABEL_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedLabelColor(color)}
                                                className={`w-8 h-8 rounded-lg transition-all ${selectedLabelColor === color ? "ring-2 ring-offset-2 ring-[#264653]" : ""
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <Button
                                        onClick={handleAddLabel}
                                        size="sm"
                                        className="w-full bg-[#2A9D8F] hover:bg-[#238b80] rounded-lg"
                                    >
                                        Adicionar etiqueta
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Checklist Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowChecklist(!showChecklist)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F7F8] dark:bg-[#334155] hover:bg-[#E0E0E0] dark:hover:bg-[#475569] text-sm text-[#264653] dark:text-white transition-colors"
                            >
                                <CheckSquare className="w-4 h-4" />
                                Checklist
                            </button>
                            {showChecklist && (
                                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-[#E0E0E0] dark:border-[#334155] p-4 z-10 animate-fade-in">
                                    <Input
                                        value={newChecklistTitle}
                                        onChange={(e) => setNewChecklistTitle(e.target.value)}
                                        placeholder="Título do checklist"
                                        className="mb-3"
                                        onKeyDown={(e) => e.key === "Enter" && handleAddChecklist()}
                                    />
                                    <Button
                                        onClick={handleAddChecklist}
                                        size="sm"
                                        className="w-full bg-[#2A9D8F] hover:bg-[#238b80] rounded-lg"
                                    >
                                        Adicionar checklist
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Due Date Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDueDate(!showDueDate)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F7F8] dark:bg-[#334155] hover:bg-[#E0E0E0] dark:hover:bg-[#475569] text-sm text-[#264653] dark:text-white transition-colors"
                            >
                                <Calendar className="w-4 h-4" />
                                Data de entrega
                            </button>
                            {showDueDate && (
                                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-[#E0E0E0] dark:border-[#334155] p-4 z-10 animate-fade-in">
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full p-2 rounded-lg border border-[#E0E0E0] dark:border-[#334155] bg-white dark:bg-[#0f172a] text-[#2B2B2B] dark:text-white mb-3"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSaveDueDate}
                                            size="sm"
                                            className="flex-1 bg-[#2A9D8F] hover:bg-[#238b80] rounded-lg"
                                        >
                                            Salvar
                                        </Button>
                                        {selectedCard.due_date && (
                                            <Button
                                                onClick={() => {
                                                    setDueDate("");
                                                    updateCard(selectedCard.list_id, selectedCard.id, { due_date: undefined });
                                                    setShowDueDate(false);
                                                }}
                                                size="sm"
                                                variant="outline"
                                                className="border-[#E76F51] text-[#E76F51] rounded-lg"
                                            >
                                                Remover
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recurring */}
                        <RecurringSelector
                            value={selectedCard.recurring}
                            onChange={(config) =>
                                updateCard(selectedCard.list_id, selectedCard.id, { recurring: config })
                            }
                        />

                        {/* Focus Mode */}
                        <button
                            onClick={handleFocusMode}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2A9D8F]/10 hover:bg-[#2A9D8F]/20 text-sm text-[#2A9D8F] transition-colors"
                        >
                            <Focus className="w-4 h-4" />
                            Modo Foco
                        </button>

                        <hr className="my-4 border-[#E0E0E0] dark:border-[#334155]" />

                        <h3 className="text-sm font-medium text-[#264653] dark:text-white mb-3">
                            Ações
                        </h3>

                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E76F51]/10 hover:bg-[#E76F51]/20 text-sm text-[#E76F51] transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Excluir card
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

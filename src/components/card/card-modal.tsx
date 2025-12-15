"use client";

import { useState } from "react";
import { useBoardStore } from "@/store/board-store";
import { Modal, Button, Input } from "@/components/ui";
import {
    X,
    AlignLeft,
    Calendar,
    Tag,
    CheckSquare,
    MessageSquare,
    User,
    Trash2,
} from "lucide-react";

export function CardModal() {
    const {
        selectedCard,
        isCardModalOpen,
        setCardModalOpen,
        setSelectedCard,
        updateCard,
        deleteCard,
        lists,
    } = useBoardStore();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(selectedCard?.title || "");
    const [description, setDescription] = useState(
        selectedCard?.description || ""
    );

    if (!selectedCard) return null;

    const currentList = lists.find((l) => l.id === selectedCard.list_id);

    const handleClose = () => {
        setCardModalOpen(false);
        setSelectedCard(null);
    };

    const handleSaveTitle = () => {
        if (title.trim()) {
            updateCard(selectedCard.list_id, selectedCard.id, { title: title.trim() });
        }
        setIsEditingTitle(false);
    };

    const handleSaveDescription = () => {
        updateCard(selectedCard.list_id, selectedCard.id, { description });
    };

    const handleDelete = () => {
        if (confirm("Tem certeza que deseja excluir este card?")) {
            deleteCard(selectedCard.list_id, selectedCard.id);
            handleClose();
        }
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
                                onClick={() => {
                                    setTitle(selectedCard.title);
                                    setIsEditingTitle(true);
                                }}
                                className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg -ml-2"
                            >
                                {selectedCard.title}
                            </h2>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            na lista <span className="font-medium">{currentList?.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Labels */}
                        {selectedCard.labels && selectedCard.labels.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Etiquetas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCard.labels.map((label) => (
                                        <span
                                            key={label.id}
                                            className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                            style={{ backgroundColor: label.color }}
                                        >
                                            {label.name || "Sem nome"}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <AlignLeft className="w-4 h-4" />
                                Descrição
                            </h3>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={handleSaveDescription}
                                placeholder="Adicione uma descrição mais detalhada..."
                                className="w-full min-h-[120px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                            />
                        </div>

                        {/* Checklists */}
                        {selectedCard.checklists && selectedCard.checklists.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4" />
                                    Checklists
                                </h3>
                                {selectedCard.checklists.map((checklist) => (
                                    <div key={checklist.id} className="mb-4">
                                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                            {checklist.title}
                                        </p>
                                        <div className="space-y-2">
                                            {checklist.items?.map((item) => (
                                                <label
                                                    key={item.id}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={item.is_completed}
                                                        onChange={() => { }}
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span
                                                        className={
                                                            item.is_completed
                                                                ? "line-through text-gray-400"
                                                                : "text-gray-700 dark:text-gray-300"
                                                        }
                                                    >
                                                        {item.title}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Comments */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Comentários
                            </h3>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                                    U
                                </div>
                                <Input placeholder="Escreva um comentário..." className="flex-1" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Adicionar ao card
                        </h3>

                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                            <User className="w-4 h-4" />
                            Membros
                        </button>

                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                            <Tag className="w-4 h-4" />
                            Etiquetas
                        </button>

                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                            <CheckSquare className="w-4 h-4" />
                            Checklist
                        </button>

                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                            <Calendar className="w-4 h-4" />
                            Data de entrega
                        </button>

                        <hr className="my-4 border-gray-200 dark:border-gray-700" />

                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Ações
                        </h3>

                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm text-red-600 dark:text-red-400 transition-colors"
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

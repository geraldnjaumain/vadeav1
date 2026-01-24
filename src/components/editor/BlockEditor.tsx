"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Plus,
    GripVertical,
    Trash2,
    Video,
    FileText,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Book
} from "lucide-react";
import { cn } from "@/lib/utils";

// Block Types
type BlockType = "module" | "lesson" | "video" | "quiz" | "text";

interface ContentBlock {
    id: string;
    type: BlockType;
    title: string;
    content: string;
    duration?: number; // minutes
    children?: ContentBlock[]; // For modules containing lessons
    isExpanded?: boolean;
}

interface BlockEditorProps {
    initialBlocks?: ContentBlock[];
    onChange?: (blocks: ContentBlock[]) => void;
    className?: string;
}

// Generate unique ID
const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Block type configuration
const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ElementType; color: string }[] = [
    { type: "module", label: "Module", icon: Book, color: "bg-purple-100 text-purple-600 border-purple-200" },
    { type: "lesson", label: "Lesson", icon: FileText, color: "bg-blue-100 text-blue-600 border-blue-200" },
    { type: "video", label: "Video", icon: Video, color: "bg-red-100 text-red-600 border-red-200" },
    { type: "quiz", label: "Quiz", icon: HelpCircle, color: "bg-green-100 text-green-600 border-green-200" },
    { type: "text", label: "Text", icon: FileText, color: "bg-zinc-100 text-zinc-600 border-zinc-200" },
];

// Course Templates
export const COURSE_TEMPLATES: { name: string; description: string; blocks: ContentBlock[] }[] = [
    {
        name: "Standard Course",
        description: "4 modules with intro, lessons, and assessments",
        blocks: [
            {
                id: generateId(),
                type: "module",
                title: "Module 1: Introduction",
                content: "",
                isExpanded: true,
                children: [
                    { id: generateId(), type: "lesson", title: "Welcome & Overview", content: "", duration: 15 },
                    { id: generateId(), type: "video", title: "What You'll Learn", content: "", duration: 10 },
                ],
            },
            {
                id: generateId(),
                type: "module",
                title: "Module 2: Core Concepts",
                content: "",
                isExpanded: false,
                children: [
                    { id: generateId(), type: "lesson", title: "Lesson 1", content: "", duration: 30 },
                    { id: generateId(), type: "lesson", title: "Lesson 2", content: "", duration: 30 },
                    { id: generateId(), type: "quiz", title: "Module Quiz", content: "", duration: 15 },
                ],
            },
            {
                id: generateId(),
                type: "module",
                title: "Module 3: Advanced Topics",
                content: "",
                isExpanded: false,
                children: [
                    { id: generateId(), type: "lesson", title: "Lesson 1", content: "", duration: 45 },
                    { id: generateId(), type: "video", title: "Demonstration", content: "", duration: 20 },
                ],
            },
            {
                id: generateId(),
                type: "module",
                title: "Module 4: Final Assessment",
                content: "",
                isExpanded: false,
                children: [
                    { id: generateId(), type: "lesson", title: "Review", content: "", duration: 20 },
                    { id: generateId(), type: "quiz", title: "Final Exam", content: "", duration: 45 },
                ],
            },
        ],
    },
    {
        name: "Quick Workshop",
        description: "Short, single-module format",
        blocks: [
            {
                id: generateId(),
                type: "module",
                title: "Workshop",
                content: "",
                isExpanded: true,
                children: [
                    { id: generateId(), type: "video", title: "Introduction", content: "", duration: 5 },
                    { id: generateId(), type: "lesson", title: "Main Content", content: "", duration: 30 },
                    { id: generateId(), type: "quiz", title: "Quick Check", content: "", duration: 10 },
                ],
            },
        ],
    },
    {
        name: "CBC Aligned",
        description: "Structured for competency-based learning",
        blocks: [
            {
                id: generateId(),
                type: "module",
                title: "Strand 1: Foundation",
                content: "",
                isExpanded: true,
                children: [
                    { id: generateId(), type: "lesson", title: "Learning Objectives", content: "", duration: 10 },
                    { id: generateId(), type: "lesson", title: "Key Concepts", content: "", duration: 30 },
                    { id: generateId(), type: "text", title: "Reflection Questions", content: "" },
                ],
            },
            {
                id: generateId(),
                type: "module",
                title: "Strand 2: Application",
                content: "",
                isExpanded: false,
                children: [
                    { id: generateId(), type: "lesson", title: "Practical Activity", content: "", duration: 45 },
                    { id: generateId(), type: "video", title: "Demonstration", content: "", duration: 15 },
                ],
            },
            {
                id: generateId(),
                type: "module",
                title: "Assessment",
                content: "",
                isExpanded: false,
                children: [
                    { id: generateId(), type: "quiz", title: "Competency Check", content: "", duration: 30 },
                    { id: generateId(), type: "text", title: "Self-Assessment Rubric", content: "" },
                ],
            },
        ],
    },
];

export function BlockEditor({ initialBlocks = [], onChange, className }: BlockEditorProps) {
    const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

    const updateBlocks = useCallback((newBlocks: ContentBlock[]) => {
        setBlocks(newBlocks);
        onChange?.(newBlocks);
    }, [onChange]);

    const addBlock = (type: BlockType, parentId?: string) => {
        const newBlock: ContentBlock = {
            id: generateId(),
            type,
            title: `New ${BLOCK_TYPES.find(b => b.type === type)?.label || "Block"}`,
            content: "",
            duration: type === "module" ? undefined : 15,
            children: type === "module" ? [] : undefined,
            isExpanded: type === "module" ? true : undefined,
        };

        if (parentId) {
            // Add to parent module
            const addToParent = (items: ContentBlock[]): ContentBlock[] => {
                return items.map(item => {
                    if (item.id === parentId && item.children) {
                        return { ...item, children: [...item.children, newBlock] };
                    }
                    if (item.children) {
                        return { ...item, children: addToParent(item.children) };
                    }
                    return item;
                });
            };
            updateBlocks(addToParent(blocks));
        } else {
            updateBlocks([...blocks, newBlock]);
        }
    };

    const deleteBlock = (id: string) => {
        const removeBlock = (items: ContentBlock[]): ContentBlock[] => {
            return items
                .filter(item => item.id !== id)
                .map(item => ({
                    ...item,
                    children: item.children ? removeBlock(item.children) : undefined,
                }));
        };
        updateBlocks(removeBlock(blocks));
    };

    const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
        const update = (items: ContentBlock[]): ContentBlock[] => {
            return items.map(item => {
                if (item.id === id) {
                    return { ...item, ...updates };
                }
                if (item.children) {
                    return { ...item, children: update(item.children) };
                }
                return item;
            });
        };
        updateBlocks(update(blocks));
    };

    const toggleExpand = (id: string) => {
        updateBlock(id, { isExpanded: !blocks.find(b => b.id === id)?.isExpanded });
    };

    const moveBlock = (id: string, direction: "up" | "down") => {
        const moveInArray = (items: ContentBlock[]): ContentBlock[] => {
            const index = items.findIndex(item => item.id === id);
            if (index === -1) {
                return items.map(item => ({
                    ...item,
                    children: item.children ? moveInArray(item.children) : undefined,
                }));
            }

            const newItems = [...items];
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= items.length) return items;

            [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
            return newItems;
        };
        updateBlocks(moveInArray(blocks));
    };

    const applyTemplate = (template: typeof COURSE_TEMPLATES[0]) => {
        // Deep clone with new IDs
        const cloneWithNewIds = (items: ContentBlock[]): ContentBlock[] => {
            return items.map(item => ({
                ...item,
                id: generateId(),
                children: item.children ? cloneWithNewIds(item.children) : undefined,
            }));
        };
        updateBlocks(cloneWithNewIds(template.blocks));
    };

    const renderBlock = (block: ContentBlock, isChild = false) => {
        const blockConfig = BLOCK_TYPES.find(b => b.type === block.type);
        if (!blockConfig) return null;

        const Icon = blockConfig.icon;
        const isEditing = editingBlockId === block.id;

        return (
            <div
                key={block.id}
                className={cn(
                    "border rounded-lg bg-white transition-all",
                    isChild ? "ml-6 mt-2" : "mt-3",
                    block.type === "module" ? "border-purple-200" : "border-zinc-200"
                )}
            >
                <div className="flex items-center gap-2 p-3">
                    <GripVertical className="h-4 w-4 text-zinc-400 cursor-grab" />
                    <div className={cn("p-1.5 rounded", blockConfig.color)}>
                        <Icon className="h-4 w-4" />
                    </div>

                    {isEditing ? (
                        <Input
                            autoFocus
                            value={block.title}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            onBlur={() => setEditingBlockId(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEditingBlockId(null)}
                            className="flex-1 h-8 text-sm"
                        />
                    ) : (
                        <span
                            className="flex-1 text-sm font-medium cursor-pointer hover:text-blue-600"
                            onClick={() => setEditingBlockId(block.id)}
                        >
                            {block.title}
                        </span>
                    )}

                    {block.duration && (
                        <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                            {block.duration} min
                        </span>
                    )}

                    <div className="flex items-center gap-1">
                        {block.type === "module" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => toggleExpand(block.id)}
                            >
                                {block.isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => moveBlock(block.id, "up")}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => moveBlock(block.id, "down")}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteBlock(block.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Module Children */}
                {block.type === "module" && block.isExpanded && (
                    <div className="border-t border-zinc-100 p-3 bg-zinc-50/50">
                        {block.children?.map(child => renderBlock(child, true))}

                        {/* Add child buttons */}
                        <div className="flex gap-2 mt-3 ml-6">
                            {BLOCK_TYPES.filter(b => b.type !== "module").map(blockType => (
                                <Button
                                    key={blockType.type}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => addBlock(blockType.type, block.id)}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {blockType.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Templates */}
            {blocks.length === 0 && (
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="text-base">Start with a Template</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                        {COURSE_TEMPLATES.map((template, index) => (
                            <button
                                key={index}
                                onClick={() => applyTemplate(template)}
                                className="p-4 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                            >
                                <div className="font-medium text-sm">{template.name}</div>
                                <div className="text-xs text-zinc-500 mt-1">{template.description}</div>
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Block List */}
            <div>
                {blocks.map(block => renderBlock(block))}
            </div>

            {/* Add Module Button */}
            <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => addBlock("module")}
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Module
            </Button>
        </div>
    );
}

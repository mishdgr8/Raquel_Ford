"use client";

import { useState, useEffect } from "react";
import { categoryService } from "@/lib/services/categories";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import styles from "./CategoryList.module.css";
import { slugify } from "@/lib/utils";

export default function CategoryListPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        categoryService.getCategories().then(setCategories);
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        const newCategory: Omit<Category, 'id'> = {
            name: newName,
            slug: slugify(newName),
            description: "",
            order: categories.length + 1
        };
        await categoryService.createCategory(newCategory);
        setNewName("");
        categoryService.getCategories().then(setCategories);
    };

    const handleUpdate = async (id: string) => {
        await categoryService.updateCategory(id, { name: editName, slug: slugify(editName) });
        setEditingId(null);
        categoryService.getCategories().then(setCategories);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this category? Articles in this category will become uncategorized.")) {
            await categoryService.deleteCategory(id);
            categoryService.getCategories().then(setCategories);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Categories</h1>
            </header>

            <form onSubmit={handleAdd} className={styles.addForm}>
                <Input
                    placeholder="New Category Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <Button type="submit">
                    <Plus size={18} />
                    <span>Add</span>
                </Button>
            </form>

            <div className={styles.list}>
                {categories.map((category) => (
                    <div key={category.id} className={styles.item}>
                        {editingId === category.id ? (
                            <div className={styles.editRow}>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={() => handleUpdate(category.id!)} className={styles.saveBtn}><Save size={18} /></button>
                                <button onClick={() => setEditingId(null)} className={styles.cancelBtn}><X size={18} /></button>
                            </div>
                        ) : (
                            <div className={styles.viewRow}>
                                <div className={styles.info}>
                                    <strong>{category.name}</strong>
                                    <span>{category.slug}</span>
                                </div>
                                <div className={styles.actions}>
                                    <button onClick={() => { setEditingId(category.id!); setEditName(category.name); }}><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(category.id!)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

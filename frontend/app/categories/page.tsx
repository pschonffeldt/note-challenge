"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Note,
  Category,
  fetchCategories,
  fetchNotes,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // editing state
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    }
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      // fetch both active and archived notes
      const [active, archived] = await Promise.all([
        fetchNotes(false),
        fetchNotes(true),
      ]);
      setNotes([...active, ...archived]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load notes for counts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadNotes();
  }, [loadCategories, loadNotes]);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await createCategory(newCategoryName.trim());
      setNewCategoryName("");
      await loadCategories();
    } catch (err) {
      console.error(err);
      setError("Failed to create category");
    }
  }

  function getNoteCountForCategory(categoryId: number) {
    return notes.reduce((count, note) => {
      const hasCategory = note.categories.some((c) => c.id === categoryId);
      return hasCategory ? count + 1 : count;
    }, 0);
  }

  function startEditingCategory(cat: Category) {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  }

  function cancelEditingCategory() {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  }

  async function saveEditingCategory(id: number) {
    if (!editingCategoryName.trim()) return;

    try {
      const updated = await updateCategory(id, editingCategoryName.trim());

      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat))
      );

      cancelEditingCategory();
    } catch (err) {
      console.error(err);
      setError("Failed to update category");
    }
  }

  async function handleDeleteCategory(id: number) {
    try {
      await deleteCategory(id);
      // reload both so counts stay correct
      await Promise.all([loadCategories(), loadNotes()]);
    } catch (err) {
      console.error(err);
      setError("Failed to delete category");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-sm text-slate-500">Manage your categories.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to active notes
            </Link>
            <Link
              href="/archived"
              className="flex h-10 items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View archived notes
            </Link>
          </div>
        </header>

        {/* Create category form */}
        <section className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Add new category</h2>
          <form
            onSubmit={handleCreateCategory}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              type="submit"
              className="flex h-10 items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add category
            </button>
          </form>
        </section>

        {/* Categories list with counts, edit, delete */}
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Categories overview</h2>

          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-slate-500">
              No categories yet. Create one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => {
                const count = getNoteCountForCategory(cat.id);
                const isEditing = editingCategoryId === cat.id;

                return (
                  <li
                    key={cat.id}
                    className="flex items-center gap-3 rounded border border-slate-200 px-3 py-2"
                  >
                    {/* Name or editor */}
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                          value={editingCategoryName}
                          onChange={(e) =>
                            setEditingCategoryName(e.target.value)
                          }
                        />
                      ) : (
                        <p className="text-sm font-semibold">{cat.name}</p>
                      )}
                    </div>

                    {/* Count moved slightly left */}
                    <p className="w-24 text-right text-xs text-slate-600">
                      {count} note{count === 1 ? "" : "s"}
                    </p>

                    {/* Actions to the right of the count */}
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEditingCategory(cat.id)}
                            className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingCategory}
                            className="rounded bg-slate-400 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-500"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditingCategory(cat)}
                            className="rounded bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

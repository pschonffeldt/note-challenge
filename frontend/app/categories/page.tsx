"use client";

import Link from "next/link";
import {
  Category,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../lib/api";

import { useEffect, useState, useCallback } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setError(null);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    const name = newCategoryName.trim();

    if (!name) {
      setError("Please enter a category name before adding.");
      setSuccess(null);
      return;
    }

    try {
      await createCategory(name);
      setNewCategoryName("");
      setError(null);
      setSuccess("Category created successfully.");
      await loadCategories();
    } catch (err) {
      setSuccess(null);
      if (err instanceof Error) {
        setError(err.message); // already friendly from api.ts
      } else {
        setError("Failed to create category.");
      }
    }
  }

  function startEditing(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setSuccess(null);
    setError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
    setSuccess(null);
  }

  async function saveEditing(id: number) {
    const name = editingName.trim();

    if (!name) {
      setError("Category name cannot be empty.");
      setSuccess(null);
      return;
    }

    try {
      await updateCategory(id, name);
      setError(null);
      setSuccess("Category updated successfully.");
      cancelEditing();
      await loadCategories();
    } catch (err) {
      setSuccess(null);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update category.");
      }
    }
  }

  async function handleDeleteCategory(id: number) {
    try {
      await deleteCategory(id);
      setError(null);
      setSuccess("Category deleted.");
      await loadCategories();
    } catch {
      setSuccess(null);
      setError("Failed to delete category.");
    }
  }

  const cannotCreateCategory = !newCategoryName.trim();
  const cannotSaveEdit = !editingName.trim() || editingId === null;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage categories</h1>
            <p className="text-sm text-slate-500">
              Create, rename and delete categories used by your notes.
            </p>
          </div>
          <Link
            href="/"
            className="flex h-10 items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to notes
          </Link>
        </header>

        {/* Global error / success alerts */}
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        {success && !error && (
          <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {success}
          </div>
        )}

        {/* Add new category */}
        <section className="mb-8 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Add new category</h2>
          <form
            onSubmit={handleCreateCategory}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (error) setError(null);
                if (success) setSuccess(null);
              }}
            />
            <button
              type="submit"
              disabled={cannotCreateCategory}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add category
            </button>
          </form>
          {cannotCreateCategory && newCategoryName.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Category name cannot be only spaces.
            </p>
          )}
        </section>

        {/* Categories list */}
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Existing categories</h2>
            {!loading && (
              <p className="text-xs text-slate-500">
                You have{" "}
                <span className="font-semibold">{categories.length}</span>{" "}
                categor{categories.length === 1 ? "y" : "ies"}.
              </p>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-slate-500">
              You don&apos;t have any categories yet. Add one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;

                return (
                  <li
                    key={cat.id}
                    className="flex flex-col items-start justify-between gap-2 rounded border border-slate-200 p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                          value={editingName}
                          onChange={(e) => {
                            setEditingName(e.target.value);
                            if (error) setError(null);
                            if (success) setSuccess(null);
                          }}
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-800">
                          {cat.name}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEditing(cat.id)}
                            disabled={cannotSaveEdit}
                            className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded bg-slate-400 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-500"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditing(cat)}
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

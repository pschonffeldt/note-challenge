"use client";

import {
  Category,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../lib/api";

import { useEffect, useState, useCallback } from "react";
import { Alert } from "../components/alert";
import { Button, ButtonLink } from "../components/button";

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
          <ButtonLink href="/" size="md">
            Back to notes
          </ButtonLink>
        </header>

        {/* Global error / success alerts */}
        <Alert variant="error" message={error} />
        {!error && <Alert variant="success" message={success} />}

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
            <Button type="submit" disabled={cannotCreateCategory}>
              Add category
            </Button>
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
                          <Button
                            type="button"
                            onClick={() => saveEditing(cat.id)}
                            disabled={cannotSaveEdit}
                            variant="success"
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            onClick={cancelEditing}
                            variant="muted"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            onClick={() => startEditing(cat)}
                            variant="secondary"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </Button>
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

"use client";

import Link from "next/link";
import {
  Note,
  Category,
  fetchCategories,
  fetchNotes,
  deleteNote,
  archiveNote,
  updateNote,
  setNoteCategories,
  unarchiveNote,
} from "../lib/api";
import { useEffect, useState, useCallback } from "react";

export default function ArchivedPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    number | "all"
  >("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // editing text
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  // editing categories
  const [categoryEditNoteId, setCategoryEditNoteId] = useState<number | null>(
    null
  );
  const [categoryEditSelection, setCategoryEditSelection] = useState<number[]>(
    []
  );

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
      const categoryId =
        selectedCategoryFilter === "all" ? undefined : selectedCategoryFilter;
      const data = await fetchNotes(true, categoryId);
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryFilter]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  function startEditing(note: Note) {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
    setEditingContent("");
  }

  async function saveEditing(id: number) {
    if (!editingTitle.trim() || !editingContent.trim()) return;

    try {
      await updateNote(id, {
        title: editingTitle,
        content: editingContent,
      });
      cancelEditing();
      await loadNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to update note");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to delete note");
    }
  }

  async function handleUnarchive(id: number) {
    try {
      await unarchiveNote(id);
      await loadNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to unarchive note");
    }
  }

  function startCategoryEdit(note: Note) {
    setCategoryEditNoteId(note.id);
    setCategoryEditSelection(note.categories.map((c) => c.id));
  }

  function cancelCategoryEdit() {
    setCategoryEditNoteId(null);
    setCategoryEditSelection([]);
  }

  function toggleCategoryInSelection(categoryId: number) {
    setCategoryEditSelection((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  async function saveCategoryEdit(noteId: number) {
    try {
      await setNoteCategories(noteId, categoryEditSelection);
      cancelCategoryEdit();
      await loadNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to update categories");
    }
  }

  const cannotSaveEdit =
    !editingTitle.trim() || !editingContent.trim() || editingId === null;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notes (Archived)</h1>
            <p className="text-sm text-slate-500">
              View, edit, unarchive or delete your archived notes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View active
            </Link>
            <Link
              href="/categories"
              className="flex h-10 items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Manage categories
            </Link>
          </div>
        </header>

        <section className="rounded-lg bg-white p-4 shadow-sm ">
          <div className="flex items-center justify-between gap-3 pb-3">
            <h2 className="mb-3 text-lg font-semibold">Archived notes</h2>
            <div className="flex flex-row justify-between gap-3">
              <p>Filter by category</p>
              <select
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                value={
                  selectedCategoryFilter === "all"
                    ? "all"
                    : String(selectedCategoryFilter)
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategoryFilter(
                    value === "all" ? "all" : Number(value)
                  );
                }}
              >
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-slate-500">
              No archived notes for this filter.
            </p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => {
                const isEditing = editingId === note.id;
                const isCategoryEditing = categoryEditNoteId === note.id;

                return (
                  <li
                    key={note.id}
                    className="flex flex-col gap-3 rounded border border-slate-200 p-3 md:flex-row md:items-start md:justify-between"
                  >
                    <div className="flex-1">
                      {isEditing ? (
                        <>
                          <input
                            className="mb-2 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                          />
                          <textarea
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                            rows={3}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                          />
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-semibold">
                            {note.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-700">
                            {note.content}
                          </p>
                        </>
                      )}

                      {/* Categories display */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {note.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                          >
                            {cat.name}
                          </span>
                        ))}
                        {note.categories.length === 0 && (
                          <span className="text-xs text-slate-400">
                            No categories
                          </span>
                        )}
                      </div>

                      {/* Category editing UI */}
                      {isCategoryEditing && categories.length > 0 && (
                        <div className="mt-3 rounded border border-slate-200 p-2">
                          <p className="mb-2 text-xs font-semibold text-slate-600">
                            Edit categories
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                              <label
                                key={cat.id}
                                className="flex items-center gap-1 text-xs text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  className="h-3 w-3"
                                  checked={categoryEditSelection.includes(
                                    cat.id
                                  )}
                                  onChange={() =>
                                    toggleCategoryInSelection(cat.id)
                                  }
                                />
                                {cat.name}
                              </label>
                            ))}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveCategoryEdit(note.id)}
                              className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelCategoryEdit}
                              className="rounded bg-slate-400 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 md:flex-col">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEditing(note.id)}
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
                            onClick={() => startEditing(note)}
                            className="rounded bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => startCategoryEdit(note)}
                            className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                          >
                            Categories
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUnarchive(note.id)}
                            className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                          >
                            Unarchive
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(note.id)}
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

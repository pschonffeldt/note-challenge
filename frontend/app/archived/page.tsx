"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Note,
  Category,
  fetchNotes,
  fetchCategories,
  deleteNote,
  unarchiveNote,
} from "../lib/api";

export default function ArchivedNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    number | "all"
  >("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const data = await fetchNotes(true, categoryId); // archived notes
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load archived notes");
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryFilter]);

  useEffect(() => {
    // load categories once
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    // reload notes when filter changes
    loadNotes();
  }, [loadNotes]);

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

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Archived notes</h1>
            <p className="text-sm text-slate-500">
              Notes you&apos;ve archived.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex items-center gap-3">
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

              <Link
                href="/"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Back to active
              </Link>

              <Link
                href="/categories"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Manage categories
              </Link>
            </div>
          </div>
        </header>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-slate-500">
              No archived notes for this filter.
            </p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="flex flex-col gap-3 rounded border border-slate-200 p-3 md:flex-row md:items-start md:justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{note.title}</h3>
                    <p className="mt-1 text-sm text-slate-700">
                      {note.content}
                    </p>

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
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <button
                      type="button"
                      onClick={() => handleUnarchive(note.id)}
                      className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
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
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

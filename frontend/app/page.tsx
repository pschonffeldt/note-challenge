"use client";

import Link from "next/link";
import {
  Note,
  Category,
  fetchCategories,
  fetchNotes,
  createNote,
  deleteNote,
  archiveNote,
  updateNote,
  setNoteCategories,
} from "./lib/api";

import { useEffect, useState, useCallback } from "react";
import { Alert } from "./components/alert";
import { Button, buttonClasses } from "./components/button";

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    number | "all"
  >("all");

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // categories for *new* note
  const [newNoteCategorySelection, setNewNoteCategorySelection] = useState<
    number[]
  >([]);

  // editing text
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  // editing categories (existing notes)
  const [categoryEditNoteId, setCategoryEditNoteId] = useState<number | null>(
    null
  );
  const [categoryEditSelection, setCategoryEditSelection] = useState<number[]>(
    []
  );

  const cannotSaveNewNote = !title.trim() || !content.trim();

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setError(null);
    } catch {
      setError("Failed to load categories.");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const categoryId =
        selectedCategoryFilter === "all" ? undefined : selectedCategoryFilter;
      const data = await fetchNotes(false, categoryId); // active notes only
      setNotes(data);
      setError(null);
    } catch {
      setError("Failed to load notes.");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryFilter]);

  useEffect(() => {
    // load categories once on mount
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    // reload notes when filter changes
    loadNotes();
  }, [loadNotes]);

  function toggleNewNoteCategory(categoryId: number) {
    setNewNoteCategorySelection((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError("Please enter both a title and content before saving.");
      setSuccess(null);
      return;
    }

    try {
      // 1) create note
      const created = await createNote({
        title: trimmedTitle,
        content: trimmedContent,
      });

      // 2) assign categories if any selected
      if (created?.id && newNoteCategorySelection.length > 0) {
        await setNoteCategories(created.id, newNoteCategorySelection);
      }

      // 3) reset form and reload notes
      setTitle("");
      setContent("");
      setNewNoteCategorySelection([]);
      setError(null);
      setSuccess("Note created successfully.");
      await loadNotes();
    } catch {
      setSuccess(null);
      setError("Failed to create note.");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteNote(id);
      setError(null);
      setSuccess("Note deleted.");
      await loadNotes();
    } catch {
      setSuccess(null);
      setError("Failed to delete note.");
    }
  }

  async function handleArchive(id: number) {
    try {
      await archiveNote(id);
      setError(null);
      setSuccess("Note archived.");
      await loadNotes();
    } catch {
      setSuccess(null);
      setError("Failed to archive note.");
    }
  }

  function startEditing(note: Note) {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
    setSuccess(null);
    setError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
    setEditingContent("");
  }

  async function saveEditing(id: number) {
    if (!editingTitle.trim() || !editingContent.trim()) {
      setError("Title and content cannot be empty.");
      setSuccess(null);
      return;
    }

    try {
      await updateNote(id, {
        title: editingTitle.trim(),
        content: editingContent.trim(),
      });
      cancelEditing();
      setError(null);
      setSuccess("Note updated successfully.");
      await loadNotes();
    } catch {
      setSuccess(null);
      setError("Failed to update note.");
    }
  }

  function startCategoryEdit(note: Note) {
    setCategoryEditNoteId(note.id);
    setCategoryEditSelection(note.categories.map((c) => c.id));
    setSuccess(null);
    setError(null);
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
      setError(null);
      setSuccess("Categories updated successfully.");
      await loadNotes();
    } catch {
      setSuccess(null);
      setError("Failed to update categories.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notes (Active)</h1>
            <p className="text-sm text-slate-500">
              Create, edit, delete, archive and categorize your notes.
            </p>
          </div>

          {/* Right side: filter + add category */}
          <div className="flex items-center gap-3">
            <Link
              href="/archived"
              className={buttonClasses({ variant: "primary", size: "md" })}
            >
              View archived
            </Link>
            <Link
              href="/categories"
              className={buttonClasses({ variant: "primary", size: "md" })}
            >
              Manage categories
            </Link>
          </div>
        </header>

        {/* Global error / success alerts */}
        <Alert variant="error" message={error} />
        {!error && <Alert variant="success" message={success} />}

        {/* New note form */}
        <section className="mb-8 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">New note</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
                if (success) setSuccess(null);
              }}
            />
            <textarea
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Content"
              rows={4}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
                if (success) setSuccess(null);
              }}
            />

            {/* Category selection for new note */}
            {categories.length > 0 && (
              <div className="rounded border border-slate-200 p-2">
                <p className="mb-2 text-xs font-semibold text-slate-600">
                  Categories for this note
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
                        checked={newNoteCategorySelection.includes(cat.id)}
                        onChange={() => toggleNewNoteCategory(cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={cannotSaveNewNote}>
              Save note
            </Button>
          </form>
        </section>

        {/* Active notes list */}
        <section className="rounded-lg bg-white p-4 shadow-sm ">
          <div className="flex items-center justify-between gap-3 pb-1">
            <h2 className="mb-1 text-lg font-semibold">Active notes</h2>
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

          {/* Count text */}
          {!loading && (
            <p className="pb-2 text-xs text-slate-500">
              Showing <span className="font-semibold">{notes.length}</span>{" "}
              active note{notes.length === 1 ? "" : "s"} for this filter.
            </p>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-slate-500">
              No notes yet for this filter. Create one above.
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
                            onChange={(e) => {
                              setEditingTitle(e.target.value);
                              if (error) setError(null);
                              if (success) setSuccess(null);
                            }}
                          />
                          <textarea
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                            rows={3}
                            value={editingContent}
                            onChange={(e) => {
                              setEditingContent(e.target.value);
                              if (error) setError(null);
                              if (success) setSuccess(null);
                            }}
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
                            <Button
                              type="button"
                              onClick={() => saveCategoryEdit(note.id)}
                              variant="success"
                              size="sm"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              onClick={cancelCategoryEdit}
                              variant="muted"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 md:flex-col">
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            onClick={() => saveEditing(note.id)}
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
                            onClick={() => startEditing(note)}
                            variant="secondary"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            onClick={() => startCategoryEdit(note)}
                            variant="info"
                            size="sm"
                          >
                            Categories
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleArchive(note.id)}
                            variant="warning"
                            size="sm"
                          >
                            Archive
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleDelete(note.id)}
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

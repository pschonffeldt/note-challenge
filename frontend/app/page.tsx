"use client";

import { useEffect, useState } from "react";
import {
  Note,
  fetchNotes,
  createNote,
  deleteNote,
  archiveNote,
  updateNote,
} from "./lib/api";

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  // editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  async function loadNotes() {
    try {
      setLoading(true);
      const data = await fetchNotes(false); // active notes
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await createNote({ title, content });
      setTitle("");
      setContent("");
      await loadNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to create note");
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

  async function handleArchive(id: number) {
    try {
      await archiveNote(id);
      await loadNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to archive note");
    }
  }

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

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notes (Active)</h1>
            <p className="text-sm text-slate-500">
              Create, edit, delete and archive notes.
            </p>
          </div>
          <a
            href="/archived"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View archived
          </a>
        </header>

        {/* New note form */}
        <section className="mb-8 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">New note</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save note
            </button>
          </form>
        </section>

        {/* Active notes list */}
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Active notes</h2>

          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-slate-500">
              No notes yet. Create one above.
            </p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => {
                const isEditing = editingId === note.id;

                return (
                  <li
                    key={note.id}
                    className="flex items-start justify-between gap-3 rounded border border-slate-200 p-3"
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
                    </div>

                    <div className="flex flex-col gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEditing(note.id)}
                            className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
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
                            onClick={() => handleArchive(note.id)}
                            className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                          >
                            Archive
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

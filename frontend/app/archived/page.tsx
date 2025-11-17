"use client";

import { useEffect, useState } from "react";
import { deleteNote, fetchNotes, Note, unarchiveNote } from "../lib/api";
import Link from "next/link";

export default function ArchivedNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNotes() {
    try {
      setLoading(true);
      const data = await fetchNotes(true); // archived
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load archived notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

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
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Archived notes</h1>
            <p className="text-sm text-slate-500">
              Notes you&apos;ve archived.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Back to active
          </Link>
        </header>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-slate-500">No archived notes.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="flex items-start justify-between gap-3 rounded border border-slate-200 p-3"
                >
                  <div>
                    <h3 className="text-sm font-semibold">{note.title}</h3>
                    <p className="mt-1 text-sm text-slate-700">
                      {note.content}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Note = {
  id: number;
  title: string;
  content: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchNotes(archived: boolean): Promise<Note[]> {
  const res = await fetch(`${API_URL}/notes?archived=${archived}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notes");
  }

  return res.json();
}

export async function createNote(data: { title: string; content: string }) {
  const res = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create note");
  }

  return res.json();
}

export async function updateNote(
  id: number,
  data: { title?: string; content?: string; archived?: boolean }
) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update note");
  }

  return res.json();
}

export async function deleteNote(id: number) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete note");
  }
}

export async function archiveNote(id: number) {
  const res = await fetch(`${API_URL}/notes/${id}/archive`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error("Failed to archive note");
  }

  return res.json();
}

export async function unarchiveNote(id: number) {
  const res = await fetch(`${API_URL}/notes/${id}/unarchive`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error("Failed to unarchive note");
  }

  return res.json();
}

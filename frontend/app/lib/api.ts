const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Category = {
  id: number;
  name: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
};

export async function fetchNotes(
  archived: boolean,
  categoryId?: number
): Promise<Note[]> {
  const params = new URLSearchParams();
  params.set("archived", archived ? "true" : "false");
  if (categoryId !== undefined) {
    params.set("categoryId", String(categoryId));
  }

  const res = await fetch(`${API_URL}/notes?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function createNote(data: { title: string; content: string }) {
  const res = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
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
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

export async function deleteNote(id: number) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete note");
}

export async function archiveNote(id: number) {
  const res = await fetch(`${API_URL}/notes/${id}/archive`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to archive note");
  return res.json();
}

export async function unarchiveNote(id: number) {
  const res = await fetch(`${API_URL}/notes/${id}/unarchive`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to unarchive note");
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function setNoteCategories(noteId: number, categoryIds: number[]) {
  const res = await fetch(`${API_URL}/notes/${noteId}/categories`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categoryIds }),
  });
  if (!res.ok) throw new Error("Failed to set note categories");
  return res.json();
}

export async function createCategory(name: string) {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("Failed to create category");
  }

  return res.json();
}

export async function updateCategory(
  id: number,
  name: string
): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("Failed to update category");
  }

  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete category");
  }
}

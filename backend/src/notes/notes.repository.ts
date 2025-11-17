// src/notes/notes.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';

// Prisma type: Note with its categories + each category entity
type NoteWithCategories = Prisma.NoteGetPayload<{
  include: { categories: { include: { category: true } } };
}>;

// Shape we return from the repository
export type NoteRecord = {
  id: number;
  title: string;
  content: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  categories: Category[];
};

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapNote(note: NoteWithCategories): NoteRecord {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      archived: note.archived,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      // note.categories is NoteCategory[] with { category: Category }
      categories: note.categories.map((nc) => nc.category),
    };
  }

  async create(data: {
    title: string;
    content: string;
    archived?: boolean;
  }): Promise<NoteRecord> {
    const note = await this.prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        archived: data.archived ?? false,
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return this.mapNote(note);
  }

  async findAll(params: {
    archived?: boolean;
    categoryId?: number;
  }): Promise<NoteRecord[]> {
    const { archived, categoryId } = params;

    const notes = await this.prisma.note.findMany({
      where: {
        ...(archived !== undefined ? { archived } : {}),
        ...(categoryId !== undefined
          ? {
              categories: {
                some: { categoryId },
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return notes.map((n) => this.mapNote(n));
  }

  async findOne(id: number): Promise<NoteRecord | null> {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return note ? this.mapNote(note) : null;
  }

  async update(
    id: number,
    data: { title?: string; content?: string; archived?: boolean },
  ): Promise<NoteRecord> {
    const note = await this.prisma.note.update({
      where: { id },
      data,
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return this.mapNote(note);
  }

  async delete(id: number): Promise<NoteRecord> {
    // First remove any category relations to avoid FK constraint errors
    await this.prisma.noteCategory.deleteMany({
      where: { noteId: id },
    });

    const note = await this.prisma.note.delete({
      where: { id },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return this.mapNote(note);
  }

  async setArchived(id: number, archived: boolean): Promise<NoteRecord> {
    const note = await this.prisma.note.update({
      where: { id },
      data: { archived },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return this.mapNote(note);
  }

  async setCategories(
    noteId: number,
    categoryIds: number[],
  ): Promise<NoteRecord | null> {
    // Remove existing relations
    await this.prisma.noteCategory.deleteMany({
      where: { noteId },
    });

    if (categoryIds.length > 0) {
      await this.prisma.noteCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          noteId,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    const updated = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return updated ? this.mapNote(updated as NoteWithCategories) : null;
  }
}

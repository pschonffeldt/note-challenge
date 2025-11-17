import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Note, Prisma } from '@prisma/client';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.NoteCreateInput): Promise<Note> {
    return this.prisma.note.create({ data });
  }

  findAll(params: {
    archived?: boolean;
    categoryId?: number;
  }): Promise<Note[]> {
    const { archived, categoryId } = params;

    return this.prisma.note.findMany({
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
    });
  }

  findOne(id: number): Promise<Note | null> {
    return this.prisma.note.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.NoteUpdateInput): Promise<Note> {
    return this.prisma.note.update({ where: { id }, data });
  }

  delete(id: number): Promise<Note> {
    return this.prisma.note.delete({ where: { id } });
  }
}

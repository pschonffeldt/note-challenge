import { Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository, NoteRecord } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepo: NotesRepository) {}

  create(dto: CreateNoteDto): Promise<NoteRecord> {
    return this.notesRepo.create({
      title: dto.title,
      content: dto.content,
      archived: dto.archived ?? false,
    });
  }

  findAll(archived?: boolean, categoryId?: number): Promise<NoteRecord[]> {
    return this.notesRepo.findAll({ archived, categoryId });
  }

  async findOne(id: number): Promise<NoteRecord> {
    const note = await this.notesRepo.findOne(id);
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    return note;
  }

  async update(id: number, dto: UpdateNoteDto): Promise<NoteRecord> {
    await this.findOne(id); // ensure it exists
    return this.notesRepo.update(id, {
      title: dto.title,
      content: dto.content,
      archived: dto.archived,
    });
  }

  async remove(id: number): Promise<NoteRecord> {
    await this.findOne(id);
    return this.notesRepo.delete(id);
  }

  async setArchived(id: number, archived: boolean): Promise<NoteRecord> {
    await this.findOne(id);
    return this.notesRepo.setArchived(id, archived);
  }

  async setCategories(
    id: number,
    categoryIds: number[],
  ): Promise<NoteRecord | null> {
    await this.findOne(id);
    return this.notesRepo.setCategories(id, categoryIds);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepo: NotesRepository) {}

  create(dto: CreateNoteDto) {
    return this.notesRepo.create({
      title: dto.title,
      content: dto.content,
      archived: dto.archived ?? false,
    });
  }

  findAll(archived?: boolean, categoryId?: number) {
    return this.notesRepo.findAll({ archived, categoryId });
  }

  async findOne(id: number) {
    const note = await this.notesRepo.findOne(id);
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  async update(id: number, dto: UpdateNoteDto) {
    await this.findOne(id);
    return this.notesRepo.update(id, { ...dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.notesRepo.delete(id);
  }

  async setArchived(id: number, archived: boolean) {
    await this.findOne(id);
    return this.notesRepo.update(id, { archived });
  }
}

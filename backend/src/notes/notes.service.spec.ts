/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Note } from '@prisma/client';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  // keep as any in tests
  let service: any;
  let notesRepository: {
    create: jest.Mock;
    findAll: jest.Mock;
    setArchived: jest.Mock;
    delete: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(() => {
    notesRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      setArchived: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
    };

    // NotesService constructor takes NotesRepository as first arg
    service = new NotesService(notesRepository as any);
  });

  describe('create', () => {
    it('creates a note successfully', async () => {
      const dto = { title: 'Note title', content: 'Note content' };
      const mockNote: Note = {
        id: 1,
        title: dto.title,
        content: dto.content,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      notesRepository.create.mockResolvedValue(mockNote);

      const result = await service.create(dto);

      // Service adds archived: false before calling repo
      expect(notesRepository.create).toHaveBeenCalledWith({
        ...dto,
        archived: false,
      });
      expect(result).toEqual(mockNote);
    });
  });

  describe('findAll', () => {
    it('fetches notes with archived flag', async () => {
      const mockNotes: Note[] = [];
      notesRepository.findAll.mockResolvedValue(mockNotes);

      const result = await service.findAll(true);

      expect(notesRepository.findAll).toHaveBeenCalledWith({
        archived: true,
        categoryId: undefined,
      });
      expect(result).toEqual(mockNotes);
    });

    it('fetches notes filtered by categoryId', async () => {
      const mockNotes: Note[] = [];
      notesRepository.findAll.mockResolvedValue(mockNotes);

      const result = await service.findAll(false, 2);

      expect(notesRepository.findAll).toHaveBeenCalledWith({
        archived: false,
        categoryId: 2,
      });
      expect(result).toEqual(mockNotes);
    });
  });

  describe('setArchived', () => {
    it('sets archived=true for a note', async () => {
      const mockNote: Note = {
        id: 1,
        title: 'Archived note',
        content: 'Some text',
        archived: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // findOne is called first inside setArchived via service.findOne
      notesRepository.findOne.mockResolvedValue(mockNote);
      notesRepository.setArchived.mockResolvedValue(mockNote);

      const result = await service.setArchived(1, true);

      expect(notesRepository.findOne).toHaveBeenCalledWith(1);
      expect(notesRepository.setArchived).toHaveBeenCalledWith(1, true);
      expect(result).toEqual(mockNote);
    });

    it('sets archived=false for a note', async () => {
      const mockNote: Note = {
        id: 2,
        title: 'Unarchived note',
        content: 'Some text',
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // same pattern: service.findOne() then repo.setArchived()
      notesRepository.findOne.mockResolvedValue(mockNote);
      notesRepository.setArchived.mockResolvedValue(mockNote);

      const result = await service.setArchived(2, false);

      expect(notesRepository.findOne).toHaveBeenCalledWith(2);
      expect(notesRepository.setArchived).toHaveBeenCalledWith(2, false);
      expect(result).toEqual(mockNote);
    });
  });

  describe('remove', () => {
    it('deletes a note by id (and uses findOne internally)', async () => {
      const mockNote: Note = {
        id: 3,
        title: 'To delete',
        content: 'Bye!',
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // findOne is called inside remove via service.findOne
      notesRepository.findOne.mockResolvedValue(mockNote);
      notesRepository.delete.mockResolvedValue(mockNote);

      const result = await service.remove(3);

      expect(notesRepository.findOne).toHaveBeenCalledWith(3);
      expect(notesRepository.delete).toHaveBeenCalledWith(3);
      expect(result).toEqual(mockNote);
    });
  });
});

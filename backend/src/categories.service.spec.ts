/* eslint-disable @typescript-eslint/unbound-method */
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Category } from '@prisma/client';
import { CategoriesService } from './categories/categories.service';
import { CreateCategoryDto } from './categories/dto/create-category.dto';
import { PrismaService } from './prisma/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('creates a category successfully when name is free', async () => {
      const dto: CreateCategoryDto = { name: 'Work' };
      const created: Category = { id: 1, name: 'Work' };

      // no existing category with this name
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.category.create as jest.Mock).mockResolvedValue(created);

      const result = await service.create(dto);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: 'Work' },
      });
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Work' },
      });
      expect(result).toEqual(created);
    });

    it('throws ConflictException when name already exists', async () => {
      const dto: CreateCategoryDto = { name: 'Work' };
      const existing: Category = { id: 10, name: 'Work' };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue(existing);

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(service.create(dto)).rejects.toThrow(
        'This category name is already in use. Categories must be unique.',
      );
    });
  });

  describe('update', () => {
    it('updates a category successfully when new name is free', async () => {
      const dto: CreateCategoryDto = { name: 'Personal' };
      const updated: Category = { id: 1, name: 'Personal' };

      // no conflicting category with that name + different id
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.category.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Personal',
          NOT: { id: 1 },
        },
      });
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Personal' },
      });
      expect(result).toEqual(updated);
    });

    it('throws ConflictException when updating to a name already in use', async () => {
      const dto: CreateCategoryDto = { name: 'Existing' };
      const existing: Category = { id: 2, name: 'Existing' };

      (prisma.category.findFirst as jest.Mock).mockResolvedValue(existing);

      await expect(service.update(1, dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(service.update(1, dto)).rejects.toThrow(
        'This category name is already in use. Categories must be unique.',
      );
    });
  });
});

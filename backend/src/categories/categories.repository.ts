import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findById(id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { name } });
  }

  create(name: string): Promise<Category> {
    return this.prisma.category.create({
      data: { name },
    });
  }
}

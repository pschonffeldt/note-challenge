import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.category.create({
      data: { name },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: number, name: string) {
    console.log('Updating category in repo', { id, name });

    return this.prisma.category.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: number) {
    console.log('Deleting category in repo', { id });

    // 1) clean up join table so FK constraints don’t explode
    await this.prisma.noteCategory.deleteMany({
      where: { categoryId: id },
    });

    // 2) delete the category itself
    return this.prisma.category.delete({
      where: { id },
    });
  }
}

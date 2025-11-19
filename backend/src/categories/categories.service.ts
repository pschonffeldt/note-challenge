import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: { name: dto.name },
      });
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'This category name is already in use. Categories must be unique.',
        );
      }
      throw err;
    }
  }

  async update(id: number, dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: { name: dto.name },
      });
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'This category name is already in use. Categories must be unique.',
        );
      }
      throw err;
    }
  }

  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}

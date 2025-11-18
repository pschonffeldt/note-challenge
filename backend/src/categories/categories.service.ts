import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const name = dto.name?.trim();

    if (!name) {
      throw new BadRequestException('Category name cannot be empty.');
    }

    const existing = await this.prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(
        'This category name is already in use. Categories must be unique.',
      );
    }

    return this.prisma.category.create({
      data: { name },
    });
  }

  async update(id: number, dto: CreateCategoryDto) {
    const name = dto.name?.trim();

    if (!name) {
      throw new BadRequestException('Category name cannot be empty.');
    }

    const existing = await this.prisma.category.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (existing) {
      throw new ConflictException(
        'This category name is already in use. Categories must be unique.',
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: { name },
    });
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  findAll() {
    return this.categoriesRepo.findAll();
  }

  async create(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    if (!name) {
      throw new ConflictException('Category name cannot be empty');
    }

    const existing = await this.categoriesRepo.findByName(name);
    if (existing) {
      throw new ConflictException('Category already exists');
    }

    return this.categoriesRepo.create(name);
  }
}

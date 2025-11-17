import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(dto: CreateCategoryDto) {
    return this.categoriesRepository.create(dto.name);
  }

  findAll() {
    return this.categoriesRepository.findAll();
  }

  update(id: number, name: string) {
    return this.categoriesRepository.update(id, name);
  }

  remove(id: number) {
    return this.categoriesRepository.remove(id);
  }
}

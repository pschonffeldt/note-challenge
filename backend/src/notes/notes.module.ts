import { Module } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';

@Module({
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
})
export class NotesModule {}

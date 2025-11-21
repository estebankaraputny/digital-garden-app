import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { NoteService } from './note.service'; 
import { UserService } from 'src/user/user.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/types/admin.types';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  // src/note/note.controller.ts

  @Post()
  @Roles(Role.ADMIN)
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @Req() req: any,
  ) {
    // El Guard ya verificó el token y puso el usuario en req.user
    const authorId = req.user.sub; 
    
    if(!authorId){
       throw new UnauthorizedException("No se pudo identificar al autor");
    }

    // Pasamos el DTO y el ID del autor al servicio
    return await this.noteService.create(createNoteDto, authorId);
  }

  @Get()
  @Public()
  async findAll() {
    return await this.noteService.findAll();
  }


  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.noteService.findOne(id);
  }

  @Get('category/:category')
  @Public()
  async findAllCategory(@Param('category') category: string) {
    return await this.noteService.findAllCategory(category);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return await this.noteService.update(id, updateNoteDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.noteService.remove(id);
  }
}
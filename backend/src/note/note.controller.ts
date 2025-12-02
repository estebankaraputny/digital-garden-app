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

  @Post()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @Req() req: any,
  ) {
   
    const authorId = req.user.sub; 
    console.log("id del autor:", authorId);

    if(!authorId){
       throw new UnauthorizedException("No se pudo identificar al autor");
    }

    // Pasamos el DTO y el ID del autor al servicio
    return await this.noteService.create(createNoteDto, authorId);
  }

  @Get('user-notes')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  async findAllLogin(@Req() req: any) {
    const userId = req.user.sub;
    return await this.noteService.findAllLogin(userId);
  }

  @Get('all-notes')
  @Public()
  async findAll() {
    return await this.noteService.findAll();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.noteService.findOne(id);
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
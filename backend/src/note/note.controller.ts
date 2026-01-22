import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, UsePipes, ValidationPipe, HttpCode, HttpStatus, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { NoteService } from './note.service'; 
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/types/admin.types';
import { Public } from 'src/common/decorators/public.decorator';
import { RequiredPlan } from '../common/decorators/plans.decorator';
import { Plan } from '@prisma/client';

@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
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
  async findAllLogin(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    const userId = req.user.sub;
    // Pasamos la página al servicio (el límite 10 lo dejamos fijo o también podrías pasarlo)
    return await this.noteService.findAllLogin(userId, page, 10);
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

 @Get('user-notes/count') 
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  async countUserNotes(@Req() req) {
    const userId = req.user.sub || req.user.id;
    const count = await this.noteService.countByUser(userId);
    return { count };
  }

  // Accesible solo para PREMIUM y UNLIMITED
  @Get('ia-chat')
  @RequiredPlan(Plan.PREMIUM)
  chatWithAI() {
    return "Hola soy la IA, tienes acceso porque pagas Premium";
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @Req() req) {
    return await this.noteService.update(id, updateNoteDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  async remove(@Param('id') id: string, @Req() req) {
    return await this.noteService.remove(id, req.user);
  }
}
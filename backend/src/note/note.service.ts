import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Role } from 'src/common/types/admin.types';
import {
  AdminAlreadyExistsException,
} from '../common/exceptions/user-exceptions';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { Note } from '@prisma/client'

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService){}


  async create(createNoteDto: CreateNoteDto, authorId: string): Promise<Note> {
    const generatedSlug = slugify(createNoteDto.title, { lower: true, strict: true })

    const newNote= await this.prisma.note.create({
      data: {
        title: createNoteDto.title,
        slug: generatedSlug,
        content: createNoteDto.content,
        category: createNoteDto.category,
        issue: createNoteDto.issue, 
        status: createNoteDto.status,
        author: {
          connect: {
            id: authorId,
          }
        }
      }
    });
    
    return newNote;
  }

  async findAll() {
    return await this.prisma.note.findMany({
      // 👇 ¡AGREGA ESTO! Sin esto, el autor nunca llegará al frontend
      include: {
        author: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });
  }

  async findOne(id: string) {
    return await this.prisma.note.findUnique({
      where: { id },
      // 👇 Agrégalo aquí también por si abres el detalle de una nota
      include: {
        author: {
          select: {
            name: true,
          }
        }
      }
    });
  }

  async findAllLogin(userId: string) {
    return await this.prisma.note.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: true
      }
    });
  }


  async findAllCategory(category: string) {
    return await this.prisma.note.findMany({
      where: {
        category: category
      }
    });
  }


  async update(id: string, updateNoteDto: UpdateNoteDto) {
    return await this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });
    }

  async remove(id: string) {
    return await this.prisma.note.delete({
      where: { id },
    });
  }

  

}
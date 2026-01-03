import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Role } from 'src/common/types/admin.types';
import {
  AdminAlreadyExistsException,
} from '../common/exceptions/user-exceptions';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { Note } from '@prisma/client'
/**Planes */
import { PLAN_LIMITS, Plan } from 'src/common/constants/plans.constants';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService){}


  async create(createNoteDto: CreateNoteDto, authorId: string): Promise<Note> {
    const generatedSlug = slugify(createNoteDto.title, { lower: true, strict: true })

    await this.checkPlanLimits(authorId);


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

/**METODO DE VALIDACION DE PLAN */

private async checkPlanLimits(userId: string) {
    // Obtenemos el usuario para saber su plan
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        profile: { 
          select:
          { plan: true }}
        } // Solo necesitamos el campo plan
    });

    if (!user) throw new ForbiddenException('Usuario no encontrado');

    // ILIMITADO, pasamos directo
    const userPlan = user?.profile?.plan as Plan; 
    if (userPlan === Plan.UNLIMITED) return;

    //Calcular el primer día del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    //Contar cuántas notas ha creado este usuario DESDE el día 1 del mes
    const notesCount = await this.prisma.note.count({
      where: {
        authorId: userId,
        createdAt: {
          gte: firstDayOfMonth, 
        },
      },
    });

    //Comparar con el límite
    const limit = PLAN_LIMITS[userPlan];

    if (notesCount >= limit) {
      throw new ForbiddenException(
        `Has alcanzado el límite de ${limit} notas mensuales de tu plan ${userPlan}. Actualiza a un plan superior.`
      );
    }
  }

  async findAll() {
    return await this.prisma.note.findMany({
      include: {
        author: {
          select: {
           email: true,
            profile: {  
              select: { 
                name: true 
              }
            }
          }
        }
      }
    });
  }

  async findOne(id: string) {
    return await this.prisma.note.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            email: true, // El email sí está en User
            profile: {   // <--- Entramos a la relación Profile
              select: { 
                name: true // El nombre ahora vive aquí
              }
            }
          }
        }
      }
    });
  }

  // backend/src/notes/notes.service.ts

  // async findAllLogin(userId: string) {
  //   return await this.prisma.note.findMany({
  //     where: {
  //       authorId: userId,
  //     },
  //     include: {
  //       author: true
  //     }
  //   });
  // }

  // En NoteService

async findAllLogin(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  // Ejecutamos dos consultas: una para los datos y otra para el total
  const [notes, total] = await Promise.all([
    this.prisma.note.findMany({
      where: { authorId: userId },
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' }, // IMPORTANTE: Ordenar en backend para que la paginación sea coherente
      include: { author: true },
    }),
    this.prisma.note.count({ where: { authorId: userId } }),
  ]);

  return {
    data: notes,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}



  async findAllCategory(category: string) {
    return await this.prisma.note.findMany({
      where: {
        category: category
      }
    });
  }


async update(id: string, updateNoteDto: UpdateNoteDto, user: any, updateAt?: Date) {
    // Buscamos la nota existente
    const note = await this.prisma.note.findUnique({ where: { id } });

    if (!note) throw new NotFoundException('Nota no encontrada');

    //VALIDACIÓN DE PERMISOS
    const userId = user.sub || user.id; 
    
    // Verificamos: ¿Es el dueño? O ¿Es Admin?
    const isOwner = note.authorId === userId;
    const isAdmin = user.roles && user.roles.includes('admin'); 

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para editar');
    }

    // Ejecutamos la actualización
    return await this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });
  }

 async remove(id: string, user: any) {
    const note = await this.prisma.note.findUnique({ where: { id } });

    if (!note) throw new NotFoundException('Nota no encontrada');

    const userId = user.sub || user.id;
    const isOwner = note.authorId === userId;
    const isAdmin = user.roles && user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar esta nota');
    }

    return await this.prisma.note.delete({
      where: { id },
    });
  }

  

}
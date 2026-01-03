import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { FindUsersDto } from './dto/find-users.dto';
import { User} from '../common/types/user.types';
import { Role } from '../common/types/admin.types';
import {
  UserNotFoundException,
  UserAlreadyExistsException,
  AdminAlreadyExistsException,
} from '../common/exceptions/user-exceptions';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'; 
import * as bcrypt from 'bcrypt';
import { equals } from 'class-validator';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = (await bcrypt.hash(createUserDto.password, 10)).split(' ').join('');

      const newUser = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });

      return { ...newUser, roles: newUser.roles as Role[] };
    } catch (error) {
      // Manejar error de email duplicado
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new UserAlreadyExistsException(createUserDto.email!);
        }
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => ({ ...user, roles: user.roles as Role[] }));
  }


 

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return { ...user, roles: user.roles as Role[] };
  }

  
  // async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
  //   try {
  //     await this.findOne(id);

  //     const updatedUser = await this.prisma.user.update({
  //       where: { id },
  //       data: updateUserDto,
  //     });

  //     return { ...updatedUser, roles: updatedUser.roles as Role[] };
  //   } catch (error) {
  //     // Manejar error de email duplicado
  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       if (error.code === 'P2002') {
  //         throw new UserAlreadyExistsException(updateUserDto.email!);
  //       }
  //     }
  //     throw error;
  //   }
  // }
  

  async remove(id: string): Promise<User> {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });

      return { ...deletedUser, roles: deletedUser.roles as Role[] };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new UserNotFoundException(id);
        }
      }
      throw error;
    }
  }

  // async findByEmail(email: string): Promise<User | null> {
  //   const user = await this.prisma.user.findUnique({
  //     where: { email },
  //   });
  //   if (!user) return null;
  //   return { ...user, roles: user.roles as Role[] };
  // }

  // async findByRole(role: Role): Promise<User[]> {
  //   const users = await this.prisma.user.findMany({
  //     where: {
  //       roles: { // The 'has' property is available on JsonFilter
  //         equals: [role],
  //       } as Prisma.JsonFilter,
  //     },
  //   });
  //   return users.map((user) => ({ ...user, roles: user.roles as Role[] }));
  // }

}
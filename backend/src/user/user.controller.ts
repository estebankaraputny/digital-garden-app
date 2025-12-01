import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service'; 
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/types/admin.types';
import { ParseIntValidationPipe } from '../common/pipes/parse-int-validation.pipe';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @Roles(Role.USER || Role.ADMIN || Role.MODERATOR)
  @Public()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // // @UseGuards(AuthGuard, RolesGuard)
  // // @Roles(Role.ADMIN)
  @Get()
  @Public()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  // @Patch(':id')
  // @Roles(Role.ADMIN)
  // @UsePipes(new ValidationPipe())
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return await this.userService.update(id, updateUserDto);
  // }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }
}
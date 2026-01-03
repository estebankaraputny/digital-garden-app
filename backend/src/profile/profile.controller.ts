// src/profile/profile.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from 'src/common/guards/auth.guard'; // Importación normal, sin miedos

@Controller('profile') // Ruta será: /api/v1/profile
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get() // GET /api/v1/profile (Ya no es /user/profile)
  @UseGuards(AuthGuard)
  async getMyProfile(@Req() req: any) {
    // Obtenemos el ID del usuario desde el token
    const userId = req.user.sub || req.user.id;
    return await this.profileService.findByUserId(userId);
  }
}
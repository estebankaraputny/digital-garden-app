// src/suscription/suscription.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service'; // Asegúrate que el archivo se llame así
import { CreateSubscriptionDto } from './dto/create-subscription.dto'; // Verifica este nombre de archivo

// ERROR DEL AUTH GUARD:
// Verifica dónde está tu AuthGuard. Si está en src/auth/auth.guard.ts, esto es correcto:
import { AuthGuard } from '../common/guards/auth.guard'; 

@Controller('suscription') // Ojo con la ruta
export class SubscriptionController {
  constructor(private readonly suscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() req: any) {
    const userId = req.user.id; // O req.user.sub, depende de tu guard
    return this.suscriptionService.createSubscription(userId, createSubscriptionDto);
  }
}
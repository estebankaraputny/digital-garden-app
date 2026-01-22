// src/suscription/suscription.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service'; 
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { AuthGuard } from '../common/guards/auth.guard'; 

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly suscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.suscriptionService.createSubscription(userId, createSubscriptionDto);
  }
}
// src/suscription/suscription.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req, Patch } from '@nestjs/common';
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

  @Get('status')
  @UseGuards(AuthGuard)
  getStatus(@Req() req: any) {
    const userId = req.user.sub;
    return this.suscriptionService.getSubscriptionStatus(userId);
  }

  @Patch('cancel')
  @UseGuards(AuthGuard)
  cancel(@Req() req: any) {
    const userId = req.user.sub;
    return this.suscriptionService.cancelSubscription(userId);
  }
}
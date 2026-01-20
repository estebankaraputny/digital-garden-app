// src/subscription/subscription.module.ts
import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { StripeModule } from '../stripe/stripe.module'; 
import { PrismaModule } from '../prisma/prisma.module'; 
import  { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    StripeModule, 
    PrismaModule,
    ConfigModule,
    JwtModule,
  ], 
  controllers: [SubscriptionController], 
  providers: [SubscriptionService],      
  exports: [SubscriptionService]         
})
export class SubscriptionModule {} 
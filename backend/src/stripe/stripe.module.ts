// src/stripe/stripe.module.ts
import { Module, Global } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';

// Opcional: @Global() hace que no tengas que importar StripeModule en cada módulo que lo use.
// Si no pones @Global(), tendrás que importar StripeModule en OrdersModule, etc.
@Module({
  providers: [StripeService],
  exports: [StripeService], // ¡Crucial para usarlo en Subscriptions!
  imports: [ConfigModule],
})
export class StripeModule {}
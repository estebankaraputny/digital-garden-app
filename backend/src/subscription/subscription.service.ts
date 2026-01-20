import { Injectable, BadRequestException } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta ruta si es necesario
import { CreateSubscriptionDto } from './dto/create-subscription.dto'; // Verifica nombre de archivo

@Injectable()
export class SubscriptionService { // <--- NOMBRE CORREGIDO (con 'b' y sin plural raro)
  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
  ) {}

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const stripeCustomer = await this.stripeService.createCustomer(user.email, user.name || '');
      customerId = stripeCustomer.id;

      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId }, // Esto funcionará tras el 'npx prisma generate'
      });
    }

    // Aquí llamamos a createSubscription, NO a createPaymentIntent
    const subscription = await this.stripeService.createSubscription(customerId, dto.priceId);
    
    const invoice = subscription.latest_invoice as any;

    return {
      subscriptionId: subscription.id,
      clientSecret: invoice.payment_intent.client_secret,
    };
  }
}
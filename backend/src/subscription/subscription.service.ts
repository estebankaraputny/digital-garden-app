import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ConfigService } from '@nestjs/config'; // Para la URL del frontend

@Injectable()
export class SubscriptionService {
  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    // 1. Validar Usuario
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user?.stripeCustomerId) {
      throw new BadRequestException('El usuario no tiene un Customer ID de Stripe asociado.');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4321';

    console.log(`🚀 Creando Checkout Session (Custom UI) para ${user.email}...`);

    try {
      // 2. CREAR SESSION DE CHECKOUT
      // Usamos ui_mode: 'custom' para que se dibuje en tu web, no en la de Stripe
      const session = await this.stripeService.stripe.checkout.sessions.create({
        customer: user.stripeCustomerId,
        mode: 'subscription',
        ui_mode: 'embedded', // <--- LA CLAVE PARA EMBEDDED CHECKOUT
        line_items: [
          {
            price: dto.priceId,
            quantity: 1,
          },
        ],
        // Stripe reemplazará {CHECKOUT_SESSION_ID} automáticamente
        return_url: `${frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`, 
        payment_method_types: ['card'], // Opcional si ya lo configuras en el Dashboard
      });

      console.log('✅ Checkout Session creada:', session.id);

      // 3. Retornamos el client_secret DE LA SESIÓN (no del payment intent)
      return {
        clientSecret: session.client_secret,
      };

    } catch (error) {
      console.error('❌ Error creando Checkout Session:', error);
      throw new InternalServerErrorException('No se pudo iniciar el proceso de pago.');
    }
  }
}
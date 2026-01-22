import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionService {
  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
        throw new BadRequestException('Usuario no encontrado.');
    }

    // --- AUTO-REPARACIÓN (LA DEJAMOS PORQUE FUNCIONA BIEN) ---
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        console.log(`⚠️ Creando customer para ${user.email}...`);
        try {
            const newCustomer = await this.stripeService.stripe.customers.create({
                email: user.email,
                name: user.name || 'Usuario',
            });
            customerId = newCustomer.id;
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId }
            });
        } catch (error) {
            console.error('Error creando customer:', error);
            throw new InternalServerErrorException('Error al registrar usuario en Stripe.');
        }
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4321';

    console.log(`🚀 Creando Checkout Session para ${user.email}...`);

    try {
      const session = await this.stripeService.stripe.checkout.sessions.create({
        customer: customerId, 
        mode: 'subscription',
        ui_mode: 'embedded',
        line_items: [
          {
            price: dto.priceId,
            quantity: 1,
          },
        ],
        // MANTENEMOS ESTO (Para que redirija al éxito)
        return_url: `${frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`, 
        
        payment_method_types: ['card'], 
        
        // ❌ ELIMINAMOS ESTA LÍNEA QUE CAUSABA EL ERROR ❌
        // redirect_on_completion: 'never', 
      });

      console.log('✅ Checkout Session creada:', session.id);

      return {
        clientSecret: session.client_secret,
      };

    } catch (error) {
      console.error('❌ Error creando Checkout Session:', error);
      throw new InternalServerErrorException('Error Stripe: ' + error.message);
    }
  }
}
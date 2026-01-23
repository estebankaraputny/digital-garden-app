import { 
  Injectable, 
  BadRequestException, 
  InternalServerErrorException, 
  NotFoundException // <--- FALTABA ESTO
} from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ConfigService } from '@nestjs/config';
import { Plan } from '@prisma/client'; // <--- FALTABA ESTO (El Enum de Prisma)

@Injectable()
export class SubscriptionService {
  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  // --- MÉTODO 1: CREAR SUSCRIPCIÓN (Con auto-reparación de Customer ID) ---
  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
        throw new BadRequestException('Usuario no encontrado.');
    }

    // Auto-reparación del Customer ID
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
        return_url: `${frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`, 
        payment_method_types: ['card'], 
      });

      return {
        clientSecret: session.client_secret,
      };

    } catch (error) {
      console.error('❌ Error creando Checkout Session:', error);
      throw new InternalServerErrorException('Error Stripe: ' + error.message);
    }
  }

  // --- MÉTODO 2: ESTADO DE SUSCRIPCIÓN (Optimizado / Leyendo BD) ---
  async getSubscriptionStatus(userId: string) {
    // 1. Consultamos SOLO la base de datos (Ultra rápido)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true } 
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // 2. Verificamos si la suscripción es válida
    const now = new Date();
    const isActive = 
        user.subscriptionStatus === 'active' && 
        user.subscriptionEndDate && 
        user.subscriptionEndDate > now;

    // 3. Devolvemos un objeto limpio
    return {
      isSubscribed: !!isActive,
      plan: user.profile?.plan || Plan.FREE, 
      status: user.subscriptionStatus || 'inactive',
      nextBillingDate: user.subscriptionEndDate,
      stripeCustomerId: user.stripeCustomerId
    };
  }


  // -- MÉTODO 3: CANCELAR SUSCRIPCIÓN (Todas)
  async cancelSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeSubscriptionId) {
      throw new BadRequestException('No hay suscripción activa para cancelar.');
    }

   const subscription = await this.stripeService.stripe.subscriptions.update(
        user.stripeSubscriptionId,
        {
          cancel_at_period_end: true, 
        }
      );

      // Opcional: Actualizamos DB inmediatamente para feedback rápido al usuario
      // (Aunque tu Webhook también lo hará en unos segundos)
      await this.prisma.user.update({
        where: { id: userId },
        data: {
        }
      });

      return {
        message: 'Tu suscripción se cancelará al final del periodo de facturación.',
        cancelAt: new Date((subscription.cancel_at || 0) * 1000),
      };

    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      throw new InternalServerErrorException('No se pudo cancelar la suscripción.');
    }
    

}
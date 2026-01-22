import { Controller, Post, Headers, Req, BadRequestException, Logger } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { Plan } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator'; // Asegúrate que esta ruta sea correcta

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Post()
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() request: Request) {
    if (!signature) throw new BadRequestException('Missing stripe-signature');

    const rawBody = (request as any).rawBody || request.body;

    let event;
    try {
      event = this.stripeService.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    const object = event.data.object as any;

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated': 
        await this.handleSubscriptionUpdate(object);
        break;

      case 'invoice.payment_succeeded':
        if (object.billing_reason === 'subscription_cycle') {
             await this.handleSubscriptionUpdate(object); 
        }
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(object);
        break;
    }

    return { received: true };
  }

  async handleSubscriptionUpdate(stripeObject: any) {
    let subscriptionId: string;
    let customerId: string;

    // 1. LÓGICA DE DETECCIÓN DE TIPO DE OBJETO
    if (stripeObject.object === 'subscription') {
        subscriptionId = stripeObject.id;
        customerId = stripeObject.customer as string;
    } else {
        subscriptionId = stripeObject.subscription as string;
        customerId = stripeObject.customer as string;
    }

    // 2. Recuperar la suscripción (CORRECCIÓN AQUÍ: 'as any')
    // Esto calla el error de TypeScript sobre 'Response<Subscription>'
    const subscription = await this.stripeService.stripe.subscriptions.retrieve(subscriptionId) as any;
    
    // 3. Obtener el ID del precio
    const priceId = subscription.items.data[0].price.id;

    // 4. VALIDACIÓN DE FECHA
    let endDate: Date;
    if (subscription.current_period_end) {
        endDate = new Date(subscription.current_period_end * 1000);
    } else {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        endDate = thirtyDaysFromNow;
    }

    // 5. TRADUCTOR
    const planEnum = this.mapPriceIdToEnum(priceId);

    console.log(`💾 Guardando en BD: Plan ${planEnum} | Expira: ${endDate.toISOString()}`);

    // 6. ACTUALIZAR BASE DE DATOS
    await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { stripeCustomerId: customerId },
            data: {
                stripeSubscriptionId: subscription.id,
                planPriceId: priceId,
                subscriptionStatus: subscription.status,
                subscriptionEndDate: endDate,
            }
        });

        if (user) {
            await tx.profile.update({
                where: { userId: user.id },
                data: {
                    plan: planEnum
                }
            });
        }
    });

    this.logger.log(`✅ Usuario actualizado a plan ${planEnum}`);
  }

  async handleSubscriptionDeleted(subscription: any) {
    await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                subscriptionStatus: 'canceled',
                planPriceId: null,
            }
        });

        await tx.profile.update({
            where: { userId: user.id },
            data: { plan: Plan.FREE }
        });
    });
    this.logger.log(`❌ Suscripción cancelada para ${subscription.id}`);
  }

  private mapPriceIdToEnum(priceId: string): Plan {
    if (priceId === process.env.PUBLIC_STRIPE_PRICE_ID_BASIC) return Plan.BASIC;
    if (priceId === process.env.PUBLIC_STRIPE_PRICE_ID_PREMIUM) return Plan.PREMIUM;
    if (priceId === process.env.PUBLIC_STRIPE_PRICE_ID_UNLIMITED) return Plan.UNLIMITED;
    
    this.logger.warn(`Price ID desconocido: ${priceId}. Asignando FREE.`);
    return Plan.FREE;
  }
}
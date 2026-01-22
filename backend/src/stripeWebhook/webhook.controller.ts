import { Controller, Post, Headers, Req, BadRequestException, Logger } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service'; // Ajusta ruta si es necesario
import { PrismaService } from '../prisma/prisma.service'; // Ajusta ruta si es necesario
import { Request } from 'express';
import { Plan } from '@prisma/client'; 

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
  ) {}

  @Post()
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() request: Request) {
    if (!signature) throw new BadRequestException('Missing stripe-signature');

    const rawBody = (request as any).rawBody || request.body;

    let event;
    try {
      event = this.stripeService.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET! // CORRECCIÓN 1: Agregamos '!' al final
      );
    } catch (err) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // CORRECCIÓN 2: Tratamos 'object' como 'any' para evitar errores de TS
    const object = event.data.object as any;

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated': 
        await this.handleSubscriptionUpdate(object);
        break;

      case 'invoice.payment_succeeded':
        // CORRECCIÓN 3: Al ser 'any', ya no marcará error en billing_reason
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

  async handleSubscriptionUpdate(stripeObject: any) { // Usamos any aquí también
    const subscriptionId = stripeObject.subscription;
    const customerId = stripeObject.customer;
    
    // CORRECCIÓN 4: Casting a 'any' para acceder a current_period_end sin problemas
    const subscription = await this.stripeService.stripe.subscriptions.retrieve(subscriptionId) as any;
    const priceId = subscription.items.data[0].price.id;

    const planEnum = this.mapPriceIdToEnum(priceId);

    await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { stripeCustomerId: customerId },
            data: {
                stripeSubscriptionId: subscription.id,
                planPriceId: priceId,
                subscriptionStatus: subscription.status,
                // Ahora TS no se quejará de current_period_end
                subscriptionEndDate: new Date(subscription.current_period_end * 1000),
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

    this.logger.log(`✅ Usuario actualizado a plan ${planEnum} (Price: ${priceId})`);
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
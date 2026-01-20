import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  priceId: string; // El ID del precio en Stripe (ej: price_1Hh...)
}
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsString()
  @IsOptional() // ← AGREGAR
  paymentMethodId?: string;
}
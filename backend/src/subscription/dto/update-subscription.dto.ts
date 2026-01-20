import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-subscription.dto';

export class UpdateSuscriptionDto extends PartialType(CreateSubscriptionDto) {}

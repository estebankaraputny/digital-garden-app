import { SetMetadata } from '@nestjs/common';
import { Plan } from '@prisma/client'; // Importa tu Enum de Prisma

export const PLAN_KEY = 'required_plan';
export const RequiredPlan = (plan: Plan) => SetMetadata(PLAN_KEY, plan);
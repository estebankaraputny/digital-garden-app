import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLAN_KEY } from '../decorators/plans.decorator';
import { Plan } from '@prisma/client';

@Injectable()
export class PlansGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Definimos la jerarquía de poder de los planes
  private readonly planWeights = {
    [Plan.FREE]: 0,
    [Plan.BASIC]: 1,
    [Plan.PREMIUM]: 2,
    [Plan.UNLIMITED]: 3,
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.getAllAndOverride<Plan>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no pide plan, dejamos pasar
    if (!requiredPlan) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // OJO: Asumimos que el "plan" viene en el JWT del usuario (ver Paso 3)
    // Si tu JWT no tiene el plan, user.plan será undefined.
    const userPlan = user.plan || Plan.FREE; 

    const requiredWeight = this.planWeights[requiredPlan];
    const userWeight = this.planWeights[userPlan];

    console.log('--- DEBUG PLANS GUARD ---');
    console.log(`🔹 Plan Requerido: ${requiredPlan} (Nivel ${requiredWeight})`);
    console.log(`🔹 Plan Usuario: ${userPlan} (Nivel ${userWeight})`);
    console.log('-------------------------');

    if (userWeight >= requiredWeight) {
      return true;
    }

    throw new ForbiddenException(
      `Necesitas el plan ${requiredPlan} o superior para acceder a este recurso. Tu plan actual es ${userPlan}.`
    );
  }
}
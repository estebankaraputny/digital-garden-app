import {
  Injectable, // Decorador que permite que esta clase sea inyectada como dependencia
  NestInterceptor, // Interfaz que define la estructura de un interceptor
  ExecutionContext, // Proporciona información sobre el contexto de ejecución actual
  CallHandler, // ermite continuar con la ejecución del siguiente handler
} from '@nestjs/common';
import { Observable } from 'rxjs'; // Tipo de RxJS para manejar flujos de datos asíncronos
// Operador de RxJS que permite ejecutar efectos secundarios sin modificar el flujo
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // context: Información sobre la petición actual
    // next: Handler para continuar con la ejecución
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    console.log(`📥 Entrada: ${method} ${url}`);

    // next.handle() continúa con la ejecución normal del controlador
    // .pipe(tap(...)) ejecuta código después de que se complete la respuesta
    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        console.log(`📤 Salida: ${method} ${url} - ${responseTime}ms`);
      }),
    );
  }
}
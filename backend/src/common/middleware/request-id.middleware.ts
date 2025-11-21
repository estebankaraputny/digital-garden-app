import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    req.headers['x-request-id'] = requestId; // Para uso interno
    res.setHeader('X-Request-ID', requestId); // Para el cliente

    console.log(
      `🔍 Request ID: ${requestId} - ${req.method} ${req.originalUrl}`,
    );
    next();
  }
}

// Funciona solo ANTES del controlador
// No Trabaja con Observables como los interceptores

// Usa Middleware para:
// ✅ Modificar headers de request/response
// ✅ Autenticación básica
// ✅ Logging de bajo nivel
// ✅ CORS, parsing de body
// ✅ Operaciones que necesitan acceso directo a Express

// Incluso puede combinarse con el logging interceptor
// Al estar seteado el header X-Request-ID, el interceptor puede usarlo
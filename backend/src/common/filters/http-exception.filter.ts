import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  // LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('HttpExceptionFilter');
    // Convierte el contexto a HTTP
    const ctx = host.switchToHttp();
    // Obtenemos el objeto Request y Response
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // Obtenemos el código de estado HTTP
    const status = exception.getStatus();

  const exceptionResponse = exception.getResponse();

    // Determinamos el mensaje real.
    // A veces es un string simple, a veces un objeto con { message: [...] } (Validaciones)
    let errorMessage = exception.message;
    
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        if ('message' in exceptionResponse) {
            errorMessage = (exceptionResponse as any).message; 
        }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage, // 👈 Usamos la variable mejorada
      error: HttpStatus[status], // Nombre del error (ej: "Conflict")
    };

    console.error(
      `${status}: ${JSON.stringify(errorMessage)} - ${request.method} ${request.url}`,
    );

    response.status(status).json(errorResponse);
  }
}


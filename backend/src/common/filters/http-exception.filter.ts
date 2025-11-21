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

    // Creamos una respuesta estructurada
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message,
      error: HttpStatus[status],
    };

    console.error(
      `🔥 Error ${status}: ${exception.message} - ${request.method} ${request.url}`,
    );

    // this.logger.error(
    //   `Logger de Nest [${request.method}] ${request.url} -> ${exception.message}`,
    // );

    response.status(status).json(errorResponse);
  }
}


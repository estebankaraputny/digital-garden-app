import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.log('PrismaClientExceptionFilter');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let error: string;

    switch (exception.code) {
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        message = 'El valor proporcionado para la columna es demasiado largo';
        error = 'Bad Request';
        break;

      case 'P2002': {
        status = HttpStatus.CONFLICT;
        // Extraer el campo que causó el conflicto
        const targets = exception.meta?.target as string[];
        const field = targets ? targets[0] : 'campo';
        message = `Ya existe un registro con este ${field}`;
        error = 'Conflict';
        break;
      }

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'El registro solicitado no fue encontrado';
        error = 'Not Found';
        break;

      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Violación de clave foránea';
        error = 'Foreign Key Constraint';
        break;

      case 'P2004':
        status = HttpStatus.BAD_REQUEST;
        message = 'Violación de restricción en la base de datos';
        error = 'Constraint Failed';
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error interno del servidor';
        error = 'Internal Server Error';
        break;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      // Incluir más detalles en desarrollo
      ...(process.env.NODE_ENV === 'development' && {
        prismaError: {
          code: exception.code,
          meta: exception.meta,
        },
      }),
    };

    console.error(
      `🔥 Prisma Error ${exception.code}: ${message} - ${request.method} ${request.url}`,
    );

    response.status(status).json(errorResponse);
  }
}

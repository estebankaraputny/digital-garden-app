import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service'; 
import { UserController } from './user.controller';
import { RequestIdMiddleware } from 'src/common/middleware/request-id.middleware';
import { ConfigService, ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes(UserController);
  }
}
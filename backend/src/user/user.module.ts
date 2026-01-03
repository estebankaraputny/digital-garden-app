import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { UserService } from './user.service'; 
import { UserController } from './user.controller';
import { RequestIdMiddleware } from 'src/common/middleware/request-id.middleware';
import { ConfigService, ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
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
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // Inyectamos el UserService
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret', 
    });
  }

  async validate(payload: any) {
   
    // Usamos el ID del token (sub) para buscar los datos REALES en la DB
    const user = await this.userService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('El usuario ya no existe');
    }

    //Retornamos el usuario COMPLETO (con roles) de la DB
    console.log('✅ ESTRATEGIA: Usuario encontrado con roles:', user.roles);
    return user; 
  }
}
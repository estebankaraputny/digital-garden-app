import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service"; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService{
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn( email: string, pass: string): Promise<{ access_token: string}> {
    const user = await this.userService.findByEmail(email);
    const isMatch = await bcrypt.compare(pass, user!.password);

    if (!isMatch){
      throw new UnauthorizedException("Credenciales invalidas");
    }
    const payload = { sub: user!.id, email: user!.email, roles: user!.roles };
    return{
      access_token: await this.jwtService.signAsync(payload),
    }
  }
}

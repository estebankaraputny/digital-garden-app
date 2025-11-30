import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service"; 
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "src/user/dto/create-user.dto";

@Injectable()
export class AuthService{
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn( email: string, pass: string): Promise<{ access_token: string}> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Credenciales invalidas");
    }
    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch){
      throw new UnauthorizedException("Credenciales invalidas");
    }
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return{
      access_token: await this.jwtService.signAsync(payload),
    }
  }

  async signUp(signUpDto: CreateUserDto) {
    const { email, password, ...userData } = signUpDto;

    console.log(signUpDto);

    const userExists = await this.userService.findByEmail(email);
    if (userExists) {
      throw new ConflictException('El email ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userService.create({
      ...userData,
      email,
      password: hashedPassword
    });
  }
}

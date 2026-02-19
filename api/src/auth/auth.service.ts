import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create(email, passwordHash);
    return this.createToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.createToken(user.id, user.email);
  }

  private createToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwt.sign(payload),
    };
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signin(dto: AuthDto) {
    const { email, password } = dto;
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new ForbiddenException('Credential incorrect2');
    const mathPassord = await argon.verify(user.hash, password);
    if (!mathPassord) throw new ForbiddenException('Credential incorrect');
    delete user.hash;
    return this.signToken(user.id, user.email);
  }
  async signup(dto: AuthDto) {
    const { email, password } = dto;
    // generate password hash
    const hash = await argon.hash(password);
    // seve the user in database
    try {
      const user = await this.prismaService.user.create({
        data: {
          email,
          hash,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credential  taken');
        }
      }
      throw error;
    }
  }
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });
    return {
      access_token: token,
    };
  }
}

import { AllConfigType } from '@/config/config.type';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { verifyPassword } from '@sandworm/nest-common';
import { UserEntity } from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';
import { LoginInput } from './dto/auth-graphql.dto';
import { AuthPayload } from './models/auth-payload';
import { JwtPayloadType } from './types/jwt-payload.type';

@Injectable()
export class AuthGraphqlService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async login(input: LoginInput): Promise<AuthPayload> {
    const { email, password } = input;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    const isPasswordValid =
      user && (await verifyPassword(password, user.password));

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const token = await this.createToken({ id: user.id });

    return {
      id: user.id,
      tokenExpires: Date.now(),
      token,
      user,
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    let payload: JwtPayloadType;
    const auth = this.configService.getOrThrow('auth', {
      infer: true,
    });
    try {
      payload = this.jwtService.verify(token, {
        secret: auth.secret,
      });
    } catch {
      throw new UnauthorizedException();
    }

    return payload;
  }

  async createToken(data: { id: string }): Promise<string> {
    const auth = this.configService.getOrThrow('auth', {
      infer: true,
    });
    const accessToken = await this.jwtService.signAsync(
      {
        id: data.id,
      },
      {
        secret: auth.secret,
        expiresIn: auth.expires,
      },
    );

    return accessToken;
  }
}

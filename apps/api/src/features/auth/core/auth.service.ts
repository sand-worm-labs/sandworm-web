import { UserService } from '@/features/user/user.service';
import { AllConfigType } from '@/config/config.type';
import { NullableType } from '@/common/types/nullable.type';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '@sandworm/nest-common';
import crypto from 'crypto';
import ms from 'ms';
import { MailService } from '@/infrastructure/mail/mail.service';
import { SocialInterface } from '@/features/social/interface/social.interface';
import { UserResponse } from '@/features/user/model/http/user.model';
import { AuthProvidersEnum } from '@/common/enums/auth-providers.enum';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { LoginResponseDto } from './dto/login-response.dto';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
  ) { }

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );


    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'notFound',
        },
      });
    }
    if (user.provider !== AuthProvidersEnum.email) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: `needLoginViaProvider:${user.provider}`,
        },
      });
    }

    if (!user.password) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    const isValidPassword = await verifyPassword(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    delete user.password;

    const user_workspace = await this.usersService.getUserWorkspaceRoles(user.id);
    return {
      user,
      roles: user_workspace,
    };
  }

  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseDto> {
    let user: NullableType<UserResponse> = null;
    const socialEmail = socialData.email?.toLowerCase();
    let userByEmail: NullableType<UserResponse> = null;

    if (socialEmail) {
      userByEmail = await this.usersService.findByEmail(socialEmail);
    }

    if (socialData.id) {
      user = await this.usersService.findBySocialIdAndProvider({
        socialId: socialData.id,
        provider: authProvider,
      });
    }

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
      }
      await this.usersService.update(user.id, user);
    } else if (userByEmail) {
      user = userByEmail;
    } else if (socialData.id) {
      user = await this.usersService.create({
        email: socialEmail ?? null,
        firstName: socialData.firstName ?? null,
        lastName: socialData.lastName ?? null,
        socialId: socialData.id,
        provider: authProvider,
      });

      user = await this.usersService.findById(user.id);
    }

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    const user_workspace = await this.usersService.getUserWorkspaceRoles(user.id);

    return {
      user,
      roles: user_workspace,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    const user = await this.usersService.create({
      ...dto,
      email: dto.email,
    });

    const authConfig = this.configService.getOrThrow('auth', { infer: true });
    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user.id,
      },
      {
        secret: authConfig.confirmEmailSecret,
        expiresIn: authConfig.confirmEmailExpires,
      },
    );

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });
  }

  async confirmEmail(hash: string): Promise<void> {
    let userId: UserResponse['id'];

    const authConfig = this.configService.getOrThrow('auth', { infer: true });

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: UserResponse['id'];
      }>(hash, {
        secret: authConfig.confirmEmailSecret,
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      });
    }
    await this.usersService.update(user.id, user);
  }

  async confirmNewEmail(hash: string): Promise<void> {
    let userId: UserResponse['id'];
    let newEmail: UserResponse['email'];

    const authConfig = this.configService.getOrThrow('auth', { infer: true });

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: UserResponse['id'];
        newEmail: UserResponse['email'];
      }>(hash, {
        secret: authConfig.confirmEmailSecret,
      });

      userId = jwtData.confirmEmailUserId;
      newEmail = jwtData.newEmail;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      });
    }

    user.email = newEmail;
    await this.usersService.update(user.id, user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailNotExists',
        },
      });
    }

    const authConfig = this.configService.getOrThrow('auth', { infer: true });
    const tokenExpiresIn = authConfig.forgotExpires;

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        secret: authConfig.forgotSecret,
        expiresIn: tokenExpiresIn,
      },
    );

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
        tokenExpires,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: UserResponse['id'];

    const authConfig = this.configService.getOrThrow('auth', { infer: true });

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: UserResponse['id'];
      }>(hash, {
        secret: authConfig.forgotSecret,
      });

      userId = jwtData.forgotUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `notFound`,
        },
      });
    }

    user.password = password;

    /// cookie stuff 

    await this.usersService.update(user.id, user);
  }

  async me(
    userId: string,
  ): Promise<NullableType<UserResponse>> {
    return this.usersService.findById(userId);
  }

  async update(
    userId: string,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<UserResponse>> {
    const currentUser = await this.usersService.findById(userId);

    if (!currentUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    if (userDto.password) {
      if (!userDto.oldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'missingOldPassword',
          },
        });
      }

      if (!currentUser.password) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        });
      }

      const isValidOldPassword = await verifyPassword(
        userDto.oldPassword,
        currentUser.password,
      );

      if (!isValidOldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        });
      } else {
        // await this.sessionService.deleteByUserIdWithExclude({
        //   userId: currentUser.id,
        //   excludeSessionId: userJwtPayload.sessionId,
        // });
      }
    }

    if (userDto.email && userDto.email !== currentUser.email) {
      const userByEmail = await this.usersService.findByEmail(userDto.email);

      if (userByEmail && userByEmail.id !== currentUser.id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailExists',
          },
        });
      }

      const authConfig = this.configService.getOrThrow('auth', { infer: true });

      const hash = await this.jwtService.signAsync(
        {
          confirmEmailUserId: currentUser.id,
          newEmail: userDto.email,
        },
        {
          secret: authConfig.confirmEmailSecret,
          expiresIn: authConfig.confirmEmailExpires,
        },
      );

      await this.mailService.confirmNewEmail({
        to: userDto.email,
        data: {
          hash,
        },
      });
    }

    delete userDto.email;
    delete userDto.oldPassword;

    await this.usersService.update(userId, userDto);

    return this.usersService.findById(userId);
  }

  async refreshToken(
  ): Promise<Omit<LoginResponseDto, 'user'>> {
     return {
      roles: [],
    };  
  }

  async softDelete(user: UserResponse): Promise<void> {
    await this.usersService.remove(user.id);
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    const authConfig = this.configService.getOrThrow('auth', { infer: true });

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayloadType>(token, {
        secret: authConfig.secret,
      });

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

}

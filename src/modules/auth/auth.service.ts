/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    HttpException,
    Inject,
    Injectable,
    InternalServerErrorException,
    RequestTimeoutException,
    Scope,
  } from '@nestjs/common';
  import { AuthCredentialsRequestDto } from './dto/auth-credentials-request.dto';
  import { LoginResponseDto } from './dto';
  import { UserStatus } from './enums/user-status.enum';
  import { UserMapper } from '../users/users.mapper';
  import { AuthRegisterRequestDto } from './dto/auth-register.dto';
  import { REQUEST } from '@nestjs/core';
  import { FirebaseLoginRequestDto } from './dto/firebase-login-request.dto';
  import { TokensService } from '../tokens/token.service';
  import { jwtDecode } from 'jwt-decode';
  import { LoginLogService } from '../login-logs/login-log.service';
  import { MailerService } from 'src/shared/mailer/mailer.service';
  import { UserEntity } from '../users/model/users.entity';
  import { BadRequestCustomException, 
          ConflictCustomException,  
          InternalServerErrorCustomException, 
          NotFoundCustomException 
        } from 'src/common/http';
  import { UserRequest } from 'src/types/request';
  import { UserRepository } from '../users/model/users.repository';
  import { ResponseService } from 'src/shared/response/response.service';
  import { UnauthorizedCustomException } from 'src/common/http/exceptions/unauthorized.exception';
  import { ResponseDto } from 'src/common/dtos';
  import { loginTemplate } from 'src/templates/auth';
  import { registerTemplate } from 'src/templates/auth/register.template';
  import { ConfigService } from '@nestjs/config';
  import { AllConfigType } from 'src/config';
  import { RefreshTokenRequestDto } from '../tokens/dto/refresh-token-request.dto';
  import { TokenResponseDto } from '../tokens/dto/token-response.dto';
  import { IFirebaseConfig } from 'src/config/firebase.config';
  import { NotFoundException } from '@nestjs/common';
  import { TokenRepository } from '../tokens/model/token.repository';
  import { FirebaseService } from '../firebase/firebase.service';
  import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
  import { RoleRepository } from '../roles/model/role.repository';
  import * as path from 'path';
  import { Response } from 'express';
  import { promises as fs } from 'fs';
  import { ERoleType } from '../roles/enums/role.enum';
import { TimeoutError } from 'rxjs';
  @Injectable({ scope: Scope.REQUEST })
  export class AuthService {
    constructor(
      @Inject(REQUEST) private req: UserRequest,
      private userRepository: UserRepository,
      private tokenRepository: TokenRepository,
      private roleRepository: RoleRepository,
      private tokenService: TokensService,
      private firebaseService: FirebaseService,
      private loginLogService: LoginLogService,
      private responseService: ResponseService,
      private mailService: MailerService,
      private configService: ConfigService<AllConfigType>,
    ) {}
  
    /**
     * User authentication
     * @param authCredentialsDto {AuthCredentialsRequestDto}
     * @returns {Promise<LoginResponseDto>}
     */
    public async login(
      authCredentialsRequestDto: AuthCredentialsRequestDto,
      ip: string,
      ua: string,
      res: Response
    ): Promise<ResponseDto<LoginResponseDto>> {
      try{
        const { username, password } = authCredentialsRequestDto;
      const user: UserEntity = await this.userRepository.findUserByUsernameOrEmail(username);
      if (!user) throw new NotFoundCustomException('User not found');
      const passwordMatch = await user.validatePassword(password);
      if (!passwordMatch) {
        throw new BadRequestCustomException('Invalid credentials');
      }
      if (user.status == UserStatus.Blocked) {
        throw new BadRequestCustomException('User blocked');
      }
      const tokens = await this.tokenService.generateTokens(user);
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 20, // 20 minutes for accessToken
      });
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days for refreshToken
      });
      console.log("the value of the environment is: " + JSON.stringify(process.env.NODE_ENV))
      const userDto = await UserMapper.toDtoPermRoles(user);
      const createdLoginLog = await this.loginLogService.create(user, ip, ua);
      await this.mailService.sendEMail({
        body: loginTemplate({
          firstName: user.firstName,
          email: user.email,
          deviceName: this.loginLogService.getDeviceOsName(ua),
          country: createdLoginLog.address,
        }),
        subject: 'You have logged in to our portal',
        to: user.email,
      });
  
      return this.responseService.makeResponse({
        message: 'Logged in successfully',
        payload: { user: userDto, tokens },
      });
    }catch(error){
      if(error instanceof NotFoundException){
        throw new NotFoundException(`User not found`);
      }
      if(error instanceof TimeoutError){
        throw new RequestTimeoutException(`Request timed out check out your internet connection`);
      }else{
        throw new InternalServerErrorCustomException(`An unknown error occured while connecting to our servers hold on!`)
      }
    }
  }  
  
    public async register(
      authRegisterDto: AuthRegisterRequestDto,
      ip: string,
      ua: string,
      res: Response
    ): Promise<ResponseDto<LoginResponseDto>> {
      const { email, username } = authRegisterDto;
  
      const userExists: UserEntity | false = await this.userRepository.findOne({
        where: [{ email }, { username }],
      });
      const profilesFile = path.resolve(
        process.cwd(),
        'src',
        'constants',
        'profiles.json'
      )
      const profilePhotosJson = JSON.parse(
        await fs.readFile(profilesFile, 'utf-8')
      )
      const profilePhotos = profilePhotosJson[0]?.images || [];
      const randomProfilePhoto = profilePhotos[Math.floor(Math.random() * profilePhotos.length)];
      if(userExists) throw new ConflictCustomException(`User already exists use a new username`);
      const userEntity = this.userRepository.create({
        username: authRegisterDto.username,
        firstName: authRegisterDto.firstName,
        lastName: authRegisterDto.lastName,
        email: authRegisterDto.email,
        password: authRegisterDto.password,
        profilePhoto: randomProfilePhoto,
        role: ERoleType.USER
      });
      const roleEntity = await this.roleRepository.findOne({
        where: { name: ERoleType.USER },
        relations: ['permissions']
      })
      userEntity.roles = Promise.resolve([roleEntity]);
      userEntity.permissions = Promise.resolve([]);
      const savedUser = await this.userRepository.save(userEntity);
      const tokens = await this.tokenService.generateTokens(savedUser);
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 20, // 20 minutes for accessToken
      });
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days for refreshToken
      });
      const userDto = await UserMapper.toDtoPermRoles(savedUser);
      this.loginLogService.create(savedUser, ip, ua);
      await this.mailService.sendEMail({
        body: registerTemplate({ firstName: savedUser.firstName }),
        subject: 'Welcome your account has been activated',
        to: savedUser.email,
      });
  
      return this.responseService.makeResponse({
        message: 'Logged in successfully',
        payload: {
          user: userDto,
          tokens,
        },
      });
    }
  
    public async logout(): Promise<ResponseDto<null>> {
      try {
        const token = this.req.headers.authorization.split(' ')[1]
        if (!token) throw new NotFoundCustomException('Not Found');
        const foundTokenEntity = await this.tokenRepository.findOneBy({
          token,
          isActive: true,
        });
        if (!foundTokenEntity) throw new NotFoundCustomException('Not Found');
        const refreshTokenEntity = await this.tokenRepository.findOneBy({
          id: foundTokenEntity.parentId,
          isActive: true,
        });
        if (!refreshTokenEntity) throw new NotFoundCustomException('Not Found');
        await this.tokenService.deactivateRefreshToken(refreshTokenEntity.token);
        return this.responseService.makeResponse({
          message: 'Logged out successfully',
          payload: null,
        });
      } catch (error) {
        throw new InternalServerErrorCustomException();
      }
    }
  
    public async logoutAll(): Promise<ResponseDto<null>> {
      try {
        const user = this.req.user;
        await this.tokenService.deactivateAllRefreshTokens(user.id);
        return this.responseService.makeResponse({
          message: 'Logged out from all devices successfully',
          payload: null,
        });
      } catch (error) {
        throw new InternalServerErrorCustomException();
      }
    }
  
    public async loginWithFirebase(
      firebaseLoginRequestDto: FirebaseLoginRequestDto,
      ip: string,
      ua: string,
    ): Promise<ResponseDto<LoginResponseDto>> {
      try {
        const { firebaseToken } = firebaseLoginRequestDto;
        let decodedToken: DecodedIdToken;
        const payload: any = jwtDecode(firebaseToken);
        if (
          payload.aud ===
          this.configService.get<IFirebaseConfig>('firebase').webClient
        ) {
          decodedToken = payload;
        } else {
          await this.firebaseService.firebaseAdmin
            .auth()
            .verifyIdToken(firebaseToken)
            .then((dT) => {
              decodedToken = dT;
              return decodedToken;
            })
            .catch((error: any) => {
              throw new UnauthorizedCustomException();
            });
        }
        const { name, email, picture: profileImage } = decodedToken;
        const user = await this.userRepository.findOneBy({ email });
        if (!user) {
          const newUser = {
            email: email,
            username: name.split(' ')[0],
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' '),
            password: Math.random().toString(36).slice(-8),
            profilePhoto: profileImage,
            role: ERoleType.USER
          };
          const userEntity = new UserEntity(newUser);
          const userRole = await this.roleRepository.findOne({
            where: { name: ERoleType.USER },
            relations: ['permissions']
          })
          userEntity.roles = Promise.resolve([userRole]);
          userEntity.permissions = Promise.resolve([]);
          const savedUser = await this.userRepository.save(userEntity);
          const tokens = await this.tokenService.generateTokens(savedUser);
          const userDto = await UserMapper.toDtoPermRoles(savedUser, { role: false });
          const createdLoginLog = await this.loginLogService.create(
            savedUser,
            ip,
            ua,
          );
  
          await this.mailService.sendEMail({
            body: loginTemplate({
              firstName: savedUser.firstName,
              email: savedUser.email,
              deviceName: this.loginLogService.getDeviceOsName(ua),
              country: createdLoginLog.address,
            }),
            subject: 'Login Attempt to our portal',
            to: savedUser.email,
          });
  
          return this.responseService.makeResponse({
            message: 'User registered successfully',
            payload: { user: userDto, tokens },
          });
        }
  
        if (user.status == UserStatus.Blocked)
          throw new BadRequestCustomException('User blocked');
  
        if (user.status == UserStatus.Inactive)
          throw new BadRequestCustomException('User inactive');
  
        const tokens = await this.tokenService.generateTokens(user);
        const userDto = await UserMapper.toDtoPermRoles(user, { role: true});
        const createdLoginLog = await this.loginLogService.create(user, ip, ua);
  
        await this.mailService.sendEMail({
          body: loginTemplate({
            firstName: user.firstName,
            email: user.email,
            deviceName: this.loginLogService.getDeviceOsName(ua),
            country: createdLoginLog.address,
          }),
          subject: 'Login Attempt to our portal',
          to: user.email,
        });
  
        return this.responseService.makeResponse({
          message: 'User logged in successfully',
          payload: {
            user: userDto,
            tokens,
          },
        });
      } catch (error) {
        if (error instanceof UnauthorizedCustomException)
          throw new UnauthorizedCustomException('Firebase Error');
        if (error instanceof NotFoundCustomException)
          throw new NotFoundCustomException('User not found');
        throw new InternalServerErrorCustomException();
      }
    }
  
    async refreshAccessToken(
      refreshTokenDto: RefreshTokenRequestDto,
    ): Promise<ResponseDto<TokenResponseDto>> {
      try {
        return this.responseService.makeResponse({
          message: 'Token refreshed successfully',
          payload: await this.tokenService.refreshAccessToken(refreshTokenDto),
        });
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new InternalServerErrorCustomException();
      }
    }
  
    decodeToken(token: string): any {
      try {
        return jwtDecode(token);
      } catch (error) {
        return new InternalServerErrorException(`Failed to Decode Token`);
      }
    }
  }
  
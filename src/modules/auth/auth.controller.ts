import {
    ValidationPipe,
    Controller,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    Get,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { AuthCredentialsRequestDto, LoginResponseDto } from './dto';
  import { AuthService } from './auth.service';
  import { AuthRegisterRequestDto } from './dto/auth-register.dto';
  import { Public } from './decorators';
  import { FirebaseLoginRequestDto } from './dto/firebase-login-request.dto';
  import { ApiCreatedCustomResponse, ApiOkCustomResponse, Ip } from 'src/common/decorators';
  import { TOKEN_NAME } from 'src/constants';
  import { Res } from '@nestjs/common';
  import { ApiBadRequestCustomResponse } from 'src/common/decorators/api-bad-request-custom-response.decorator';
  import { ApiInternalServerErrorCustomResponse } from 'src/common/decorators/api-ise-custom-response.decorator';
  import { NullDto } from 'src/common/dtos/null.dto';
  import { ResponseDto } from 'src/common/dtos';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { RefreshTokenRequestDto } from '../tokens/dto/refresh-token-request.dto';
  import { TokenResponseDto } from '../tokens/dto/token-response.dto';
  
  @ApiTags('Auth')
  @Controller({
    path: 'auth',
    version: '1',
  })
  @ApiBadRequestCustomResponse(NullDto)
  @ApiInternalServerErrorCustomResponse(NullDto)
  export class AuthController {
    constructor(private authService: AuthService) {}
    @Post('/register')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedCustomResponse(LoginResponseDto)
    register(
      @Body(ValidationPipe) authRegisterDto: AuthRegisterRequestDto,
      @Ip() ip: string,
      @Headers('user-agent') ua: string,
    ): Promise<ResponseDto<LoginResponseDto>> {
      return this.authService.register(authRegisterDto, ip, ua);
    }
  
    @ApiOkCustomResponse(LoginResponseDto)
    @HttpCode(HttpStatus.OK)
    @Post('/login')
    @Public()
    login(
      @Body(ValidationPipe) authCredentialsDto: AuthCredentialsRequestDto,
      @Ip() ip: string,
      @Headers('user-agent') ua: string,
      @Res({ passthrough: true }) res: Response,
    ): Promise<ResponseDto<LoginResponseDto>> {
      return this.authService.login(authCredentialsDto, ip, ua, res);
    }
  
    @Post('/firebase/register')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkCustomResponse(LoginResponseDto)
    registerWithFirebase(
      @Body(ValidationPipe) firebaseLoginRequestDto: FirebaseLoginRequestDto,
      @Ip() ip: string,
      @Headers('user-agent') ua: string,
    ): Promise<ResponseDto<LoginResponseDto>> {
      return this.authService.loginWithFirebase(firebaseLoginRequestDto, ip, ua);
    }
  
    @Post('/firebase/login')
    @Public()
    @ApiOkCustomResponse(LoginResponseDto)
    @HttpCode(HttpStatus.OK)
    loginWithFirebase(
      @Body(ValidationPipe) firebaseLoginRequestDto: FirebaseLoginRequestDto,
      @Ip() ip: string,
      @Headers('user-agent') ua: string,
    ): Promise<ResponseDto<LoginResponseDto>> {
      return this.authService.loginWithFirebase(firebaseLoginRequestDto, ip, ua);
    }
  
    @Post('/refresh-token')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkCustomResponse(TokenResponseDto)
    refreshToken(
      @Body() refreshTokenDto: RefreshTokenRequestDto,
    ): Promise<ResponseDto<TokenResponseDto>> {
      return this.authService.refreshAccessToken(refreshTokenDto);
    }
  
    @Get('/logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth(TOKEN_NAME)
    @ApiOkCustomResponse(NullDto)
    logout(): Promise<ResponseDto<null>> {
      return this.authService.logout();
    }
  
    @Get('/logout/all')
    @ApiBearerAuth(TOKEN_NAME)
    @ApiOkCustomResponse(NullDto)
    @HttpCode(HttpStatus.OK)
    logoutAll(): Promise<ResponseDto<null>> {
      return this.authService.logoutAll();
    }
  }
  
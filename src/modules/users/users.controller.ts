import {
    ValidationPipe,
    ParseUUIDPipe,
    Controller,
    Param,
    Body,
    Get,
    Delete,
    Patch,
    Post,
    Query
  } from '@nestjs/common';
  import { ApiOkPaginatedResponse, PaginationParams, PaginationRequest } from 'src/helpers/pagination';
  import { UserResponseDto } from './dto';
  import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiTags,
  } from '@nestjs/swagger';
  import { UsersService } from './users.service';
  import { PaginationResponseDto } from 'src/helpers/pagination/pagination-response.dto';
  import { TOKEN_NAME } from 'src/constants';
  import { ApiOkCustomResponse } from 'src/common/decorators';
  import { ResponseDto } from 'src/common/dtos';
  import { UserDto } from './dto/user-dto';
  import { ApiConsumes } from '@nestjs/swagger';
  import { ApiInternalServerErrorCustomResponse } from 'src/common/decorators/api-ise-custom-response.decorator';
  import { NullDto } from 'src/common/dtos/null.dto';
  import { ApiBadRequestCustomResponse } from 'src/common/decorators/api-bad-request-custom-response.decorator';
  import { ApiUnauthorizedCustomResponse } from 'src/common/decorators/api-unauthorized-custom-response.decorator';
  import { ApiForbiddenCustomResponse } from 'src/common/decorators/api-forbidden-custom-response.decorator';
  import { ApiConflictCustomResponse } from 'src/common/decorators/api-conflict-custom-response.decorator';
  import { VerifyResetPasswordResponseDto } from './dto/verify-reset-password-response.dto';
  import { VerifyPasswordResetOtpDTO } from './dto/verify-reset-password.dto';
  import { Permissions } from '../auth/decorators/permissions.decorator';
  import { CloudinaryService } from '../cloudinary/cloudinary.service';
  import { ResetPasswordDTO } from './dto/reset-password.dto';
  import { ChangePasswordRequestDto } from './dto';
  import { CurrentUser } from '../auth/decorators';
  import { UploadedFiles } from '@nestjs/common';
  import { BadRequestCustomException } from 'src/common/http';
  import { UpdateUserDto } from './dto';
  import { UserEntity } from './model/users.entity';
  import { RequestResetPasswordDTO } from './dto/request-reset-password.dto';
  import { BadRequestException } from '@nestjs/common';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { UseInterceptors } from '@nestjs/common';
  import { UpdateUserRequestDto } from './dto/update-user-request.dto';
  import { Public } from '../auth/decorators';
  @ApiTags('Users')
  @Controller({
    path: 'users',
    version: '1',
  })
  @ApiInternalServerErrorCustomResponse(NullDto)
  @ApiBadRequestCustomResponse(NullDto)
  export class UsersController {
    constructor(
      private readonly usersService: UsersService,
      private readonly cloudinaryService: CloudinaryService, 
    ) {}
  
    @ApiOperation({ description: 'Get a paginated user list' })
    @ApiOkPaginatedResponse(UserDto)
    @ApiQuery({
      name: 'search',
      type: 'string',
      required: false,
    })
    @ApiQuery({
      name: 'deleted',
      type: 'boolean',
      required: false,
    })
    @ApiQuery({
      name: 'permissions',
      type: 'boolean',
      required: false,
    })
    @ApiQuery({
      name: 'roles',
      type: 'boolean',
      required: false,
    })
    @Permissions('read.users')
    @ApiOkPaginatedResponse(UserDto)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiForbiddenCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Get()
    public getUsers(
      @PaginationParams() pagination: PaginationRequest,
    ): Promise<ResponseDto<PaginationResponseDto<UserDto>>> {
      return this.usersService.getUsers(pagination);
    }
  
    @ApiOperation({ description: 'Get user by id' })
    @ApiOkCustomResponse(UserResponseDto)
    @Public()
    @Get('/user/:id')
    @ApiQuery({
      name: 'roles',
      type: 'boolean',
      required: false,
    })
    @ApiQuery({
      name: 'permissions',
      type: 'boolean',
      required: false,
    })
    public getUserById(
      @Param('id', ParseUUIDPipe) id: string,
      @Query('roles') roles?: string,
      @Query('permissions') permissions?: string,
    ): Promise<ResponseDto<UserResponseDto>> {
      return this.usersService.getUserById(id, { roles, permissions });
    }

  @ApiOperation({ description: 'Get profile' })
  @ApiOkCustomResponse(UserResponseDto)
  @Get('/get-profile')
  @ApiBearerAuth(TOKEN_NAME)
  public getProfile(): Promise<ResponseDto<UserResponseDto>> {
    return this.usersService.getProfile();
  }
  
    private static async imageFileFilter(req, file, callback){
      if(!file.mimetype.startsWith('image/')){
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    }

    @ApiOperation({ description: 'Update user based on id' })
    @ApiOkCustomResponse(UserResponseDto)
    @ApiConflictCustomResponse(NullDto)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Patch('/update-user/:id')
    @UseInterceptors(
      FilesInterceptor('profileImage', 10, {
          fileFilter: UsersController.imageFileFilter,
          limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
      }),
  )
    @ApiConsumes('multipart/form-data')
    async updateUser(
      @Param('id', ParseUUIDPipe) id: string,
      @Body(ValidationPipe) userDto: UpdateUserRequestDto,
      @UploadedFiles() files: {
        profile_image: Express.Multer.File[]
      }
    ): Promise<ResponseDto<UserResponseDto>> {
        
        const fieldMappings = [
            { field: 'profileImage', folder: 'jivah_profile_images', assignTo: 'uploaded_profile_image', isArray: false }
        ]
        const uploadedImages: Record<string, any> = {};
        await Promise.all(
            fieldMappings.map(async ({ field, folder, assignTo }) => {
                const file = files[field];
                if(!file)return;
                const result = await this.cloudinaryService.uploadFileToCloudinary(file[0], folder);
                uploadedImages[assignTo] = result.secure_url; 
            })
        )
        const updatedUserDto: UpdateUserDto = {
            ...userDto,
            profileImage: uploadedImages['uploaded_profile_image']
        }
        return this.usersService.updateUser(id, updatedUserDto);
      }catch(error){
        throw new BadRequestCustomException(`User failed to update, ${error.message}`);
      }

      @ApiOperation({ description: 'Change password' })
      @ApiOkCustomResponse(UserResponseDto)
      @ApiUnauthorizedCustomResponse(NullDto)
      @ApiBadRequestCustomResponse(NullDto)
      @ApiBearerAuth(TOKEN_NAME)
      @Post('/change/password')
      changePassword(
        @Body(ValidationPipe) changePassword: ChangePasswordRequestDto,
        @CurrentUser() user: UserEntity,
      ): Promise<ResponseDto<UserResponseDto>> {
        return this.usersService.changePassword(changePassword, user.id);
      }
    
      @ApiOperation({ description: 'Request reset password' })
      @Post('/request/reset/password')
      @Public()
      requestResetPassword(
        @Body(ValidationPipe) requestResetPasswordDto: RequestResetPasswordDTO,
      ): Promise<ResponseDto<null>> {
        return this.usersService.requestResetPassword(requestResetPasswordDto);
      }
    

  @ApiOperation({ description: 'Verify reset password' })
  @Post('/verify/reset/password')
  @Public()
  verifyResetPassword(
    @Body(ValidationPipe) verifyPasswordResetOtpDto: VerifyPasswordResetOtpDTO,
  ): Promise<ResponseDto<VerifyResetPasswordResponseDto>> {
    return this.usersService.verifyResetPassword(verifyPasswordResetOtpDto);
  }

  @ApiOperation({ description: 'Change user password' })
  @Post('/reset/password')
  @Public()
  resetPassword(
    @Body(ValidationPipe) resetPassword: ResetPasswordDTO,
  ): Promise<ResponseDto<null>> {
    return this.usersService.resetPassword(resetPassword);
  }


      @ApiOperation({ description: 'Delete user' })
      @ApiOkCustomResponse(ResponseDto<string>)
      @ApiBearerAuth(TOKEN_NAME)
      @Delete('/delete-user/:id')
      public deleteUser(
        @Param('id', ParseUUIDPipe) id: string
      ): Promise<ResponseDto<string>> {
        return this.usersService.deleteUser(id);
      }
}
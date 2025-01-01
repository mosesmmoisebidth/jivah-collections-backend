import {
    ValidationPipe,
    ParseUUIDPipe,
    Controller,
    Param,
    Body,
    Get,
    Delete,
    Patch,
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
  import { Permissions } from '../auth/decorators/permissions.decorator';
  import { CloudinaryService } from '../cloudinary/cloudinary.service';
  import { UploadedFiles } from '@nestjs/common';
  import { BadRequestCustomException } from 'src/common/http';
  import { UpdateUserDto } from './dto';
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
    @ApiQuery({
      name: 'properties',
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
    @Get('/:id')
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
    @ApiQuery({
      name: 'properties',
      type: 'boolean',
      required: false,
    })
    public getUserById(
      @Param('id', ParseUUIDPipe) id: string,
      @Query('roles') roles?: string,
      @Query('permissions') permissions?: string,
      @Query('properties') properties?: string,
    ): Promise<ResponseDto<UserResponseDto>> {
      return this.usersService.getUserById(id, { roles, permissions, properties });
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

    @ApiOperation({ description: 'Update user by firebase based on id' })
    @ApiOkCustomResponse(UserResponseDto)
    @ApiConflictCustomResponse(NullDto)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Patch('/:id')
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
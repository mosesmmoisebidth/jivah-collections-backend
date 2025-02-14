import {
    InternalServerErrorException,
    RequestTimeoutException,
    Injectable,
    BadRequestException,
    NotFoundException,
    Scope,
    Inject,
  } from '@nestjs/common';
  import { ChangePasswordRequestDto, UserResponseDto } from './dto';
  import { PaginationRequest } from 'src/helpers/pagination';
  import { DBErrorCode } from 'src/common/enums';
  import { HashHelper } from 'src/helpers';
  import { TimeoutError } from 'rxjs';
  import { ILike } from 'typeorm';
  import { PaginationResponseDto } from 'src/helpers/pagination/pagination-response.dto';
  import { handlePaginate } from 'src/helpers/pagination/pagination.helper';
  import { RequestResetPasswordDTO } from './dto/request-reset-password.dto';
  import { VerifyPasswordResetOtpDTO } from './dto/verify-reset-password.dto';
  import { ResetPasswordDTO } from './dto/reset-password.dto';
  import { OTPService } from '../otp/otp.service';
  import { EReason } from '../otp/enums/otp.reason';
  import { MailerService } from 'src/shared/mailer/mailer.service';
  import { ResetPasswordService } from '../reset-password/reset-password.service';
  import { BadRequestCustomException, ConflictCustomException, InternalServerErrorCustomException, NotFoundCustomException } from 'src/common/http';
  import { UserRepository } from './model/users.repository';
  import { ResponseDto } from 'src/common/dtos';
  import { ResponseService } from 'src/shared/response/response.service';
  import { VerifyResetPasswordResponseDto } from './dto/verify-reset-password-response.dto';
  import { UserDto } from './dto/user-dto';
  import { UserRequest } from 'src/types/request';
  import { CreateUserDto } from './dto/create-user.dto';
  import { REQUEST } from '@nestjs/core';
  import { CustomException } from 'src/common/http/exceptions/custom.exception';
  import { CreatedUserDto } from './dto/created-user.dto';
  import { isTrueOrFalse } from 'src/utils/boolean.util';
  import { UserEntity } from './model/users.entity';
  import * as crypto from 'crypto';
  import { registerUserTemplate } from 'src/templates/auth/register-user.template';
  import { UserStatus } from '../auth/enums/user-status.enum';
  import { UpdateUserDto } from './dto';
  import * as path from 'path';
  import { RoleRepository } from '../roles/model/role.repository';
  import { promises as fs } from 'fs';
import { UserMapper } from './users.mapper';
import { ERoleType } from '../roles/enums/role.enum';
import { AddPermissionsToUser } from './dto/add-permissions.dto';
import { RemovePermissionsFromUserDto } from './dto/remove-permissions.dto';
  @Injectable({ scope: Scope.REQUEST })
  export class UsersService {
    constructor(
      @Inject(REQUEST) private req: UserRequest,
      private readonly userRepository: UserRepository,
      private readonly otpService: OTPService,
      private readonly roleRepository: RoleRepository,
      private readonly resetPasswordService: ResetPasswordService,
      private readonly mailService: MailerService,
      private readonly responseService: ResponseService,
    ) {}
  
    /**
     * Get a paginated user list
     * @param pagination {PaginationRequest}
     * @returns {Promise<PaginationResponseDto<UserResponseDto>>}
     */
    private getFilterTypes(permissions: boolean, roles: boolean): string[] {
      const filterTypes = [];
      if (permissions) filterTypes.push("permissions");
      if (roles) filterTypes.push("roles");
      return filterTypes.length ? filterTypes : ["permissions", "roles"];
    }
    public async getUsers(
      pagination: PaginationRequest,
    ): Promise<ResponseDto<PaginationResponseDto<UserDto>>> {
      try {
        const search = pagination.params?.search ?? '';
        const deleted = isTrueOrFalse(pagination.params?.deleted ?? '');
        const permissions = isTrueOrFalse(pagination.params?.permissions ?? '');
        const roles = isTrueOrFalse(pagination.params?.roles ?? '');
        const filters = this.getFilterTypes(permissions, roles);
        const users = await handlePaginate(this.userRepository, pagination, {
          order: pagination.order,
          where: [
            {
              username: ILike(`%${search}%`),
            },
            {
              firstName: ILike(`%${search}%`),
            },
            {
              lastName: ILike(`%${search}%`),
            },
          ],
          relations: filters
        });
        const active_users = users.items.filter(
          (user) => user.status === UserStatus.Active,
        );
        const deleted_users = users.items.filter(
          (user) => user.status === UserStatus.Deleted,
        );
        if (deleted) {
            const deleted_users_response = await Promise.all(
                deleted_users.map(async (user) => 
                await UserMapper.toDtoPermRoles(user))
            )
          const totalDeletedUsers: PaginationResponseDto<UserDto> = {
            items: deleted_users_response,
            itemCount: deleted_users_response.length,
            totalItems: deleted_users.length,
            itemsPerPage: pagination.limit,
            totalPages: Math.ceil(deleted_users.length / pagination.limit),
            currentPage: pagination.page,
          };
          return this.responseService.makeResponse({
            message: 'Deleted users retrieved',
            payload: totalDeletedUsers,
          });
        }
        const active_users_response = await Promise.all(
          active_users.map((active_user: UserEntity) => 
          UserMapper.toDtoPermRoles(active_user, { permissions, roles }))
        )
        const totalActiveUsers: PaginationResponseDto<UserDto> = {
          items: active_users_response,
          itemCount: active_users_response.length,
          totalItems: active_users.length,
          itemsPerPage: pagination.limit,
          totalPages: Math.ceil(active_users.length / pagination.limit),
          currentPage: pagination.page,
        };
        return this.responseService.makeResponse({
          message: 'Users retrieved successfully',
          payload: totalActiveUsers,
        });
      } catch (error) {
        if (error instanceof NotFoundCustomException) {
          throw new NotFoundCustomException('Not found');
        }
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException();
        } else {
          throw new InternalServerErrorException();
        }
      }
    }

    private static generatePassword(length = 12): string {
      return crypto.randomBytes(length).toString("hex").slice(0, length);
   }
    public async createUser(
      dto: CreateUserDto
    ): Promise<ResponseDto<CreatedUserDto>> {
      try{
        const { email, username } = dto;
        const userExists = await this.userRepository.findOne({
          where: [{ username }, { email }],
        });
        if(userExists){
          throw new ConflictCustomException(`User already exsist`);
        }
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
        const tempPassword = UsersService.generatePassword();
        const RESET_LINK = "http://jivah-collections-backend.onrender.com/swagger"
        const userEntity = await this.userRepository.create({
          email,
          username,
          firstName: dto.firstName,
          lastName: dto.lastName,
          password: tempPassword,
          role: dto.role,
          profilePhoto: randomProfilePhoto
        });
        if(dto.role === ERoleType.ADMIN){
          const roleEntity = await this.roleRepository.findOne({
            where: { name: ERoleType.ADMIN },
            relations: ['permissions']
          })
          userEntity.roles = Promise.resolve([roleEntity]);
          userEntity.permissions = Promise.resolve([]);
          const savedUser = await this.userRepository.save(userEntity);
          const createdUser = new CreatedUserDto();
          createdUser.id = savedUser.id;
          createdUser.username = savedUser.username;
          createdUser.email = savedUser.email;
          createdUser.createdAt = savedUser.createdAt;
          createdUser.updatedAt = savedUser.updatedAt;
          await this.mailService.sendEMail({
            body: registerUserTemplate({
              firstName: dto.firstName,
              username,
              password: tempPassword,
              resetLink: RESET_LINK
            }),
            subject: `User Registration`,
            to: savedUser.email
          })
          return this.responseService.makeResponse({
            message: `User created succesfully`,
            payload: createdUser
          })
        }
        const roleEntity = await this.roleRepository.findOne({
          where: { name: ERoleType.USER },
          relations: ['permissions']
        });
        userEntity.roles = Promise.resolve([roleEntity]);
        userEntity.permissions = Promise.resolve([]);
        const savedUser = await this.userRepository.save(userEntity);
        const createdUser = new CreatedUserDto();
        createdUser.id = savedUser.id;
        createdUser.username = savedUser.username;
        createdUser.email = savedUser.email;
        createdUser.createdAt = savedUser.createdAt;
        createdUser.updatedAt = savedUser.updatedAt;
        await this.mailService.sendEMail({
          body: registerUserTemplate({
            firstName: dto.firstName,
            username,
            password: tempPassword,
            resetLink: RESET_LINK
          }),
          subject: `User Registration`,
          to: savedUser.email
        })
        return this.responseService.makeResponse({
          message: `User created successfully`,
          payload: createdUser
        })
      }catch(error){
        console.log("the error stack is: " + error.stack);
        if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
          throw new ConflictCustomException('User already exists');
        }
        if (
          error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
          error.code == DBErrorCode.PgNotNullConstraintViolation
        ) {
          throw new BadRequestCustomException('Bad Request ensure you are authorized to use this API');
        }
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException(`Check your internet connection or th eproxy`);
        } else {
          throw new InternalServerErrorException(`An unknown error occured while updatig our systems check on your side`);
        }
      }
    }
    /**
     * Get user by id
     * @param id {string}
     * @returns {ResponseDto<UserResponseDto>}
     */
    public async getUserById(
      id: string,
      params: { roles?: string, permissions?: string,   }
    ): Promise<ResponseDto<UserResponseDto>> {
      const roles = isTrueOrFalse(params?.roles ?? '');
      const permissions = isTrueOrFalse(params?.permissions ?? '');
      let filters = this.getFilterTypes(permissions, roles);
      filters = [...filters]
      const userEntity = await this.userRepository.findOne({ where: { id }, relations: filters });
      if (!userEntity || userEntity.status === UserStatus.Deleted) {
        throw new NotFoundCustomException('Not found');
      }
      const user_response = await UserMapper.toDtoPermRoles(userEntity, { permissions, roles });
      return this.responseService.makeResponse({
        message: 'User found by id',
        payload: {
          user: user_response,
        },
      });
    }
    /**
     * Update User by id
     * @param id {string}
     * @param userDto {UpdateUserRequestDto}
     * @returns {ResponseDto<UserResponseDto>}
     */
    public async updateUser(
      id: string,
      userDto: UpdateUserDto,
    ): Promise<ResponseDto<UserResponseDto>> {
      let userEntity = await this.userRepository.findOne({
        where: { id, status: UserStatus.Active },
      });
      if (!userEntity) {
        throw new NotFoundCustomException('Not found');
      }
  
      try {
        userEntity = UserMapper.toUpdateEntity(userEntity, userDto);
        userEntity = await this.userRepository.save(userEntity);
        const user = await UserMapper.toDtoPermRoles(userEntity);
  
        return this.responseService.makeResponse({
          message: 'User updated successfully',
          payload: { user },
        });
      } catch (error) {
        if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
          console.log("the error " + error.stack);
          throw new ConflictCustomException('User already exists');
        }
        if (
          error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
          error.code == DBErrorCode.PgNotNullConstraintViolation
        ) {
          throw new BadRequestCustomException('Foreign Key Constraint');
        }
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException();
        } else {
          throw new InternalServerErrorException();
        }
      }
    }
  
    /**
     * Change user password
     * @param changePassword {ChangePasswordRequestDto}
     * @param user {string}
     * @returns {ResponseDto<UserResponseDto>}
     */
    public async changePassword(
      changePassword: ChangePasswordRequestDto,
      userId: string,
    ): Promise<ResponseDto<UserResponseDto>> {
      const { currentPassword, newPassword } = changePassword;
  
      const userEntity = await this.userRepository.findOne({
        where: { id: userId },
      });
  
      if (!userEntity) {
        throw new NotFoundCustomException('Not found');
      }
  
      const passwordMatch = await HashHelper.compare(
        currentPassword,
        userEntity.password,
      );
  
      if (!passwordMatch) {
        throw new BadRequestCustomException('Invalid password');
      }
  
      try {
        userEntity.password = await HashHelper.encrypt(newPassword);
        await this.userRepository.save(userEntity);
        const user = await UserMapper.toDtoPermRoles(userEntity);
        return this.responseService.makeResponse({
          message: 'Password changed successfully',
          payload: { user },
        });
      } catch (error) {
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException();
        } else {
          throw new InternalServerErrorException();
        }
      }
    }
  
    async requestResetPassword(
      dto: RequestResetPasswordDTO,
    ): Promise<ResponseDto<null>> {
      try {
        const validity = 30;
  
        const otp = this.otpService.generateOTP();
  
        const reason: EReason = EReason.RESET_PASSWORD;
  
        const user = await this.userRepository.findOneBy({
          email: dto.email,
        });
  
        if (!user) throw new NotFoundCustomException('Not found');
  
        await this.otpService.createOTP({
          otp,
          validity,
          reason,
          user,
        });
  
        await this.mailService.sendEMail({
          body: `Your OTP is ${otp}. It will expire in ${validity} minutes.`,
          subject: 'Password Reset OTP',
          to: dto.email,
        });
  
        return this.responseService.makeResponse({
          message: 'OTP was sent to your email!',
          payload: null,
        });
      } catch (error) {
        console.log("the error stack is: " + error.stack);
        throw new InternalServerErrorCustomException('Internal Server Error');
      }
    }
  
    async verifyResetPassword(
      verifyResetPasswordDTO: VerifyPasswordResetOtpDTO,
    ): Promise<ResponseDto<VerifyResetPasswordResponseDto>> {
      const { otp, email } = verifyResetPasswordDTO;
  
      const user = await this.userRepository.findOneBy({ email });
  
      if (!user) throw new NotFoundCustomException('Not found');
  
      const otpData = await this.otpService.findOTP({
        user,
        otp,
      });
  
      if (otpData === 'not-found') throw new NotFoundCustomException('Not found');
  
      if (otpData === 'expired')
        throw new BadRequestCustomException('OTP expired');
  
      if (otpData === 'inactive')
        throw new BadRequestCustomException('Inactive OTP');
  
      const resetToken =
        await this.resetPasswordService.createAndSaveResetPasswordToken(user);
  
      return this.responseService.makeResponse({
        message: 'Use this reset token',
        payload: { resetToken },
      });
    }
  
    async resetPassword(
      resetPasswordDTO: ResetPasswordDTO,
    ): Promise<ResponseDto<null>> {
      const { newPassword, resetToken } = resetPasswordDTO;
  
      const userId = await this.resetPasswordService.findUserId(resetToken);
  
      if (!userId) throw new BadRequestException();
  
      const user = await this.userRepository.findOneBy({ id: userId });
  
      if (!user) throw new NotFoundCustomException('Not found');
  
      const doesPasswordExist = await user.validatePassword(newPassword);
  
      if (doesPasswordExist)
        throw new BadRequestCustomException('Invalid password');
  
      const hashed_password = await HashHelper.encrypt(newPassword);
  
      await this.userRepository.update(
        { id: userId },
        {
          password: hashed_password,
        },
      );
  
      return this.responseService.makeResponse({
        message: 'Password reset successfully',
        payload: null,
      });
    }
  
    async getProfile(): Promise<ResponseDto<UserResponseDto>> {
      const userEntity = await this.userRepository.findOneBy({
        id: this.req.user.id,
        status: UserStatus.Active,
      });
      console.log("added some consoles for debugging");
      if (!userEntity) throw new NotFoundException();
      return this.responseService.makeResponse({
        message: 'Profile found',
        payload: {
          user: await UserMapper.toDtoPermRoles(userEntity),
        },
      });
    }
  
    /**
     * @param id {String}
     * @returns ResponseDto<String>
     */
    async deleteUser(id: string): Promise<ResponseDto<string>> {
      const userEntity = await this.userRepository.findOne({ where: { id } });
      if (!userEntity) {
        throw new NotFoundException(`user ${id} not found`);
      }
      try {
        userEntity.status = UserStatus.Deleted;
        await this.userRepository.save(userEntity);
        return this.responseService.makeResponse({
          message: `User ${id} has been deleted`,
          payload: null,
        });
      } catch (error) {
        if (
          error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
          error.code == DBErrorCode.PgNotNullConstraintViolation
        ) {
          throw new BadRequestCustomException(error);
        }
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException();
        } else {
          throw new InternalServerErrorCustomException(error);
        }
      }
    }

    public async addPermissions(
      id: string,
      addPermissionDto: AddPermissionsToUser
   ): Promise<ResponseDto<UserResponseDto>> {
      try {
         const userEntity = await this.userRepository.findOneBy({
            id,
            status: UserStatus.Active
         });

         if (!userEntity) throw new NotFoundException();

         const permissionIds = (await userEntity.permissions).map((permission) => permission.id);

         const validPermissions = addPermissionDto.permissions.filter(
            (permission) => !permissionIds.includes(permission)
         );

         if (validPermissions.length === 0) {
            throw new BadRequestCustomException(`Role ${id} already has the permissions`);
         }

         await UserMapper.addPermissions(userEntity, addPermissionDto.permissions);

         const updatedUserEntity = await this.userRepository.findOneBy({ id });

         const user = await UserMapper.toDtoPermRoles(updatedUserEntity, {
            permissions: true,
            roles: true
         });

         return this.responseService.makeResponse({
            message: "User updated successfully",
            payload: { user }
         });
      } catch (error) {
         throw new CustomException(error);
      }
   }

   public async removePermissions(
    id: string,
    removeRolesDto: RemovePermissionsFromUserDto
 ): Promise<ResponseDto<UserResponseDto>> {
    const userEntity = await this.userRepository.findOne({
      where: {
        id,
       status: UserStatus.Active,
      },
      relations: ['permissions', 'roles']
    });
    if (!userEntity) throw new NotFoundException();
    try {
       await UserMapper.removePermissions(userEntity, removeRolesDto.permissions);
       const updatedUserEntity = await this.userRepository.findOneBy({ id });
       const user = await UserMapper.toDtoPermRoles(updatedUserEntity, {
          roles: true,
          permissions: true
       });
       return this.responseService.makeResponse({
          message: "User updated successfully",
          payload: { user }
       });
    } catch (error) {
       throw new CustomException(error);
    }
 }

  }
  
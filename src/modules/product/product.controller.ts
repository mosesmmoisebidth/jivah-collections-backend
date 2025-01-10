import { Controller, InternalServerErrorException, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { ApiOkCustomResponse } from 'src/common/decorators';
import { ResponseDto } from 'src/common/dtos';
import { ParseUUIDPipe } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { NullDto } from 'src/common/dtos/null.dto';
import { PaginationResponseDto } from 'src/helpers/pagination/pagination-response.dto';
import { ApiOkPaginatedResponse, PaginationParams, PaginationRequest } from 'src/helpers/pagination';
import { ProductService } from './product.service';
import { ProductResponseDto } from './dtos/product-response.dto';
import { ApiQuery } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Get, Post,Body, Patch } from '@nestjs/common';
import { TOKEN_NAME } from 'src/constants';
import { ApiConsumes } from '@nestjs/swagger';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadedFiles } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { CreateProductGeneralRequestDto } from './dtos/create-product-general.dto';
import { ApiUnauthorizedCustomResponse } from 'src/common/decorators/api-unauthorized-custom-response.decorator';
import { ApiForbiddenCustomResponse } from 'src/common/decorators/api-forbidden-custom-response.decorator';
import { ProductGeneralDto } from './dtos/product-general.dto';
import { UpdateProductInventoryDto } from './dtos/update-product-inventory.dto';
import { PairQuantityDto } from './dtos/pair-quantity.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UpdateProductRequestDto } from './dtos/update-product-request.dto';

@Controller({
    path: 'products',
    version: '1'
})
@ApiTags('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly cloudinaryService: CloudinaryService
    ){}

    private static async imageFileFilter(req, file, callback){
        if(!file.mimetype.startsWith('image/')){
          return callback(new BadRequestException('Only image files are allowed'), false);
        }
        callback(null, true);
      }

    @ApiOperation({ description: 'Get all products' })
    @ApiOkPaginatedResponse(ProductGeneralDto)
    @ApiQuery({
        name: 'search',
        type: 'string',
        required: false
    })
    @ApiQuery({
        name: 'category',
        type: 'string',
        required: false
    })
    @ApiForbiddenCustomResponse(NullDto)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Get('/all')
    public getAllProducts(
        @PaginationParams() pagination: PaginationRequest
    ): Promise<ResponseDto<PaginationResponseDto<ProductResponseDto>>> {
        return this.productService.getAllProducts(pagination);
    }

    @ApiOperation({ description: 'Create a new product' })
    @ApiOkCustomResponse(ResponseDto<string>)
    @ApiForbiddenCustomResponse(NullDto)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Post('/product/add')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'product_image', maxCount: 1 },
            { name: 'product_gallery', maxCount: 10 }
        ], {
            fileFilter: ProductController.imageFileFilter,
            limits: { fileSize: 5 * 1024 * 1024 }
        }
    )
    )
    @ApiBearerAuth(TOKEN_NAME)
    @ApiConsumes('multipart/form-data')
    public async addProduct(
        @Body(ValidationPipe) createProductGeneralDto: CreateProductGeneralRequestDto,
        @UploadedFiles() files: {
            product_image?: Express.Multer.File[],
            product_gallery?: Express.Multer.File[]
        }
    ): Promise<ResponseDto<string>> {
        try{
            const filedMappings = [
                { field: 'product_image', folder: 'product_images', assignTo: 'uploaded_product_images', isArray: false },
                { field: 'product_gallery', folder: 'product_galleries', assignTo: 'uploaded_product_galleries', isArray: true }
            ]
            const uploadedImages: Record<string, any> = {};
            await Promise.all(
                filedMappings.map(async({ field, folder, assignTo, isArray }) => {
                    const fileData = files?.[field];
                    if(!fileData) return;
                    if(isArray){
                        const results = await this.cloudinaryService.uploadFiles(fileData, folder);
                        uploadedImages[assignTo] = results.map((result) => result.secure_url);
                    }else{
                        const result = await this.cloudinaryService.uploadFileToCloudinary(fileData[0], folder);
                        uploadedImages[assignTo] = result.secure_url;
                    }
                })
            )
            const createProductDto: CreateProductDto = {
                ...createProductGeneralDto,
                product_image: files?.product_image ? uploadedImages['uploaded_product_images'] : undefined,
                product_gallery: files?.product_gallery ? uploadedImages['uploaded_product_galleries'] : undefined
            }
            return this.productService.createProduct(createProductDto);
        }catch(error){
            throw new InternalServerErrorException(`Unknown erorr occured while creating your product, ${error.message}`);
        }
    }

    @ApiOperation({ description: 'update product inventory' })
    @ApiOkCustomResponse(ResponseDto<string>)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiForbiddenCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Patch('/product/inventory/:id')
    public updateProductInventory(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(ValidationPipe) dto: UpdateProductInventoryDto,
    ): Promise<ResponseDto<string>> {
        return this.productService.updateProductInventory(id, dto);
    }

    @ApiOperation({ description: 'update product general' })
    @ApiOkCustomResponse(ResponseDto<string>)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiForbiddenCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Patch('/product/general/:id')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'product_image', maxCount: 1 },
            { name: 'product_gallery', maxCount: 10 }
        ], {
            fileFilter: ProductController.imageFileFilter,
            limits: { fileSize: 5 * 1024 * 1024 }
        }
    )
    )
    public async updateProductGeneral(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(ValidationPipe) dto: UpdateProductRequestDto,
        @UploadedFiles() files: {
            product_image?: Express.Multer.File[],
            product_gallery?: Express.Multer.File[]
        }
    ): Promise<ResponseDto<string>> {
        const fieldMappings = [
            { field: 'product_image', folder: 'product_images', assignTo: 'uploaded_product_images', isArray: false },
            { field: 'product_gallery', folder: 'product_galleries', assignTo: 'uploaded_product_galleries', isArray: true }
        ]
        const uploadedImages: Record<string, any> = {}
        await Promise.all(
            fieldMappings.map(async({ field, folder, assignTo, isArray }) => {
                const fileData = files[field];
                if(!fileData) return;
                if(isArray){
                    const results = await this.cloudinaryService.uploadFiles(fileData, folder);
                    uploadedImages[assignTo] = results.map((result) => result.secure_url);
                }else{
                    const result = await this.cloudinaryService.uploadFileToCloudinary(fileData[0], folder);
                    uploadedImages[assignTo] = result.secure_url;
                }
            })
        )
        const updateProductGeneralDto: UpdateProductDto = {
            ...dto,
            product_image: files?.product_image ? uploadedImages['uploaded_product_images'] : undefined,
            product_gallery: files?.product_gallery ? uploadedImages['uploaded_product_galleries'] : undefined
        }
        return this.productService.updateProductGeneral(id, updateProductGeneralDto);
    }

    @ApiOperation({ description: 'Update product pair quantity' })
    @ApiOkCustomResponse(ResponseDto<string>)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiForbiddenCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Patch('/product/pair-quantity/:id')
    public updateProductPairQuantity(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(ValidationPipe) dto: PairQuantityDto
    ): Promise<ResponseDto<string>> {
        return this.productService.updatePairQuantity(id, dto);
    }

    @ApiOperation({ description: 'Add to cart' })
    @ApiOkCustomResponse(ResponseDto<string>)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiForbiddenCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Patch('/product/add-cart/:id')
    public addToCart(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<ResponseDto<string>> {
        return this.productService.addToCart(id);
    }

    @ApiOperation({ description: 'Add to cart' })
    @ApiOkCustomResponse(ResponseDto<string>)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiForbiddenCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Patch('/product/remove-cart/:id')
    public removeProductFromCart(
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<ResponseDto<string>> {
        return this.productService.removeProductFromCart(id);
    }

    @ApiOperation({ description: 'Add to cart' })
    @ApiOkCustomResponse(ResponseDto<string>)
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiForbiddenCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Patch('/product/update-cart-quantity/:id')
    public updateCartQuantity(
        id: string
    ): Promise<ResponseDto<string>> {
        return this.productService.updateCartQuantity(id);
    }

}
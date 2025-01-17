import { Injectable, Scope, Inject } from "@nestjs/common";
import { ProductGeneralRepository } from "./model/product-general.repository";
import { ProductMapper } from "./product.mapper";
import { ResponseDto } from "src/common/dtos";
import { CacheService } from "../caching/cache.service";
import { ICachingConfig } from "src/config";
import { ProductGeneralEntity } from "./model/product-general.entity";
import { AllConfigType } from "src/config";
import { ResponseService } from "src/shared/response/response.service";
import { ConfigService } from "@nestjs/config";
import { DBErrorCode } from "src/common/enums";
import { ConflictCustomException, InternalServerErrorCustomException, NotFoundCustomException } from "src/common/http";
import { CreateProductDto } from "./dtos/create-product.dto";
import { BadRequestCustomException } from "src/common/http";
import { NotFoundException } from "@nestjs/common";
import { UserRepository } from "../users/model/users.repository";
import { PaginationRequest } from "src/helpers/pagination";
import { ProductResponseDto } from "./dtos/product-response.dto";
import { PaginationResponseDto } from "src/helpers/pagination/pagination-response.dto";
import { TimeoutError } from "rxjs";
import { REQUEST } from "@nestjs/core";
import { UserStatus } from "../auth/enums/user-status.enum";
import { UserRequest } from "src/types/request";
import { In } from 'typeorm';
import { EProductCategory } from "./enums/product-category.enum";
import { CartRepository } from "../cart/model/cart.repository";
import { InternalServerErrorException } from "@nestjs/common";
import { RequestTimeoutException } from "@nestjs/common";
import { EProductStatus } from "./enums/roduct-status.enum";
import { PairQuantityDto } from "./dtos/pair-quantity.dto";
import { UpdateProductInventoryDto } from "./dtos/update-product-inventory.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { Logger } from "@nestjs/common";
import { CartProductRepository } from "../cart/model/cart-product.repository";
import { ECartStatus } from "../cart/enums/cart-status.enum";
import { ViewCartResponseDto } from "./dtos/view-cart-response.dto";
import { CustomException } from "src/common/http/exceptions/custom.exception";
import { ProductGeneralDto } from "./dtos/product-general.dto";
import { ProductOperationResponseDto } from "./dtos/product-operation-response.dto";
@Injectable({ scope: Scope.REQUEST })
export class ProductService {

    constructor(
        @Inject(REQUEST) private readonly req: UserRequest,
        private readonly userRepository: UserRepository,
        private productRepository: ProductGeneralRepository,
        private readonly cacheService: CacheService,
        private readonly responseService: ResponseService,
        private readonly cartRepository: CartRepository,
        private readonly cartProductRepository: CartProductRepository,
        private readonly configService: ConfigService<AllConfigType>
    ){}
    private readonly logger = new Logger(ProductService.name)
    private readonly cacheKey = this.configService.get<ICachingConfig>('cache').cache_key;
    private readonly cacheDuration = parseInt(this.configService.get<ICachingConfig>('cache').cache_duration)
    private readonly statuses: EProductStatus[] = [
        EProductStatus.ON_SALE,
        EProductStatus.OFF_SALE,
        EProductStatus.IN_STOCK,
        EProductStatus.DISCOUNTED
    ]

    private isMatch(fieldName: string, filterValue: string): boolean {
      return fieldName === filterValue;
    }

    private isAlmostMatch(fieldName: string, filterValue: string): boolean {
      const similarityThreshold = 0.88;
      const str1 = fieldName.toLowerCase();
      const str2 = filterValue.toLowerCase();
  
      const calculateLevenshteinDistance = (a: string, b: string): number => {
          const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
              Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
          );
          for (let i = 1; i <= a.length; i++) {
              for (let j = 1; j <= b.length; j++) {
                  const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                  matrix[i][j] = Math.min(
                      matrix[i - 1][j] + 1,
                      matrix[i][j - 1] + 1,
                      matrix[i - 1][j - 1] + cost
                  );
              }
          }
          return matrix[a.length][b.length];
      };
      const levenshteinDistance = calculateLevenshteinDistance(str1, str2);
      const maxLength = Math.max(str1.length, str2.length);
      const similarity = 1 - levenshteinDistance / maxLength;
      return similarity >= similarityThreshold;
  }

    private validateEnumType<T>(
      value: string,
      enumType: T,
      fieldName: string,
      logger: Logger
    ): string | null {
      if(Object.values(enumType).includes(value as T)){
        return value;
      }else{
        logger.debug(`Invalid value for ${fieldName} ${value}`);
        return null;
      }
    }

    private getPaginatedResponseJobs<T>(items: any[], pagination: PaginationRequest): PaginationResponseDto<T> {
        const itemCount = items.length;
        const totalPages = Math.ceil(itemCount / pagination.limit);
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedItems = items.slice(startIndex, endIndex);
        return {
          items: paginatedItems,
          itemCount: paginatedItems.length,
          totalItems: itemCount,
          itemsPerPage: pagination.limit,
          totalPages,
          currentPage: pagination.page,
        };
      }
    async createProduct(
        productDto: CreateProductDto
    ): Promise<ResponseDto<string>> {
        try{
            const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey) || [];
            const product = ProductMapper.toCreateEntity(productDto);
            const savedProduct = await this.productRepository.save(product);
            all_products.push(savedProduct);
            await this.cacheService.set(this.cacheKey, all_products, this.cacheDuration);
            return this.responseService.makeResponse({
                message: `Product created successfully`,
                payload: null
            })
        }catch(error){
          console.log("the erorr is: " + error.stack);
            if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
                throw new ConflictCustomException('Your Job has already been created.');
              }
              if (
                error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
                error.code == DBErrorCode.PgNotNullConstraintViolation
              ) {
                throw new BadRequestCustomException('Some job fields or attributes are empty fill them before continuing');
              }
              if (error instanceof NotFoundException) {
                throw new NotFoundException(error);
              }
              if (error instanceof TimeoutError) {
                throw new RequestTimeoutException(`Request timed out check your internet connection`);
              } else {
                throw new InternalServerErrorException(`An error occured while creating your job hold on as our engineers are trying to resolve the problem`);
              }
        }
    }

    private filterProducts(items: ProductGeneralEntity[], filters: any): ProductGeneralEntity[] {
      const { search, category } = filters;
      const isAnyActive = !search && !category;
      if(isAnyActive){
        return items;
      }
      return items.filter((product) => {
        return (
          (search && (search !== '' || search !== null || search !== undefined) && (this.isMatch(product.product_name, search) || this.isAlmostMatch(product.product_name, search))) ||
          (category && (category !== '' || category !== null || category !== undefined) && (this.isMatch(product.category, category) || this.isAlmostMatch(product.category, category)))
        )
      })
    }

    async getAllProducts(
        pagination: PaginationRequest
    ): Promise<ResponseDto<PaginationResponseDto<ProductResponseDto>>> {
        try{
          const {
            search = pagination.params?.search ?? '',
            category = (pagination.params?.category && this.validateEnumType(pagination.params?.category, EProductCategory, 'product category', this.logger)) ?? '',
          } = pagination.params || {};
            let all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey) || []
            if(!all_products || all_products.length === 0){
                all_products = await this.productRepository.find({ where: { status: In(this.statuses)}})
                await this.cacheService.set(this.cacheKey, all_products, this.cacheDuration);
            }
            all_products = this.filterProducts(all_products, { search, category });
            const products = all_products.map(product => ProductMapper.toDtoProduct(product));
            const paginatedResponse = await this.getPaginatedResponseJobs(products, pagination);
            return this.responseService.makeResponse({
                message: `Products fetched successfully`,
                payload: paginatedResponse
            })
        }catch(error){
          console.log("the error stack is: " + error.stack);
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`Seems like no current products in the shop`);
              }
            if(error instanceof TimeoutError){
                throw new RequestTimeoutException(`Request timed out check your internet connection`);
            }else{
                throw new InternalServerErrorCustomException(`An unknown error occured while connecting to the server hold on!`);
            }
        }
    }

    async getProductById(
      productId: string
    ): Promise<ResponseDto<ProductGeneralDto>> {
      try{
        const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey) || [];
        let product = all_products.find((product) => product.id === productId && this.statuses.includes(product.status))
        if(!product){
          product = await this.productRepository.findOne({
            where: { id: productId, status: In(this.statuses) }
          })
        }
        const productDto = ProductMapper.toDtoProduct(product);
        return this.responseService.makeResponse({
          message: `Product retrieved`,
          payload: productDto
        })
      }catch(error){
        if (error instanceof NotFoundException) {
          throw new NotFoundException(`Seems like no current products in the shop`);
        }
      if(error instanceof TimeoutError){
          throw new RequestTimeoutException(`Request timed out check your internet connection`);
      }else{
          throw new InternalServerErrorCustomException(`An unknown error occured while connecting to the server hold on!`);
      }
      }
    }

    async updateProductInventory(
        id: string,
        dto: UpdateProductInventoryDto
    ): Promise<ResponseDto<ProductOperationResponseDto>> {
        try{
            const product = await this.productRepository.findOne({
              where: { id, status: In(this.statuses) },
              relations: ['cartProducts']
            });
            const updatedProduct = ProductMapper.toUpdateEntity(product, dto);
            updatedProduct.cartProducts = product.cartProducts;
            const savedProduct = await this.productRepository.save(updatedProduct);
            await this.cacheService.update(this.cacheKey, savedProduct.id, savedProduct)
            return this.responseService.makeResponse({
                message: `Product updated`,
                payload: { product: ProductMapper.toProductOperation(savedProduct) }
            })
        }catch(error){
          console.log("the error stack is: " + error.stack);
            if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
                throw new ConflictCustomException('Your product has already been updated');
              }
              if (
                error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
                error.code == DBErrorCode.PgNotNullConstraintViolation
              ) {
                throw new BadRequestCustomException('Some fields are missing while updating the product');
              }
              if (error instanceof NotFoundException) {
                throw new NotFoundException(error);
              }
              if (error instanceof TimeoutError) {
                throw new RequestTimeoutException(`Request timed out check your internet connection`);
              } else {
                throw new InternalServerErrorException(`An unknown error occured while updating your job hold on!`);
              }
        }
    }

    async updateProductGeneral(
        id: string,
        dto: UpdateProductDto
    ): Promise<ResponseDto<ProductOperationResponseDto>> {
        try{
            const product = await this.productRepository.findOne({
              where: { id, status: In(this.statuses) },
              relations: ['cartProducts']
            })
            const updatedProduct = ProductMapper.toUpdateGeneralEntity(product, dto);
            updatedProduct.cartProducts = product.cartProducts;
            const savedProduct = await this.productRepository.save(updatedProduct);
            await this.cacheService.update(this.cacheKey, savedProduct.id, savedProduct)
            return this.responseService.makeResponse({
                message: `Product updated successfully`,
                payload:  {product: ProductMapper.toProductOperation(savedProduct) }
            })
        }catch(error){
            if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
                throw new ConflictCustomException('Your product has already been updated');
              }
              if (
                error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
                error.code == DBErrorCode.PgNotNullConstraintViolation
              ) {
                throw new BadRequestCustomException('Some fields are missing while updating the product');
              }
              if (error instanceof NotFoundException) {
                throw new NotFoundException(error);
              }
              if (error instanceof TimeoutError) {
                throw new RequestTimeoutException(`Request timed out check your internet connection`);
              } else {
                throw new InternalServerErrorException(`An unknown error occured while updating your job hold on!`);
              }
        }
    }

    async addToCart(
        productId: string
    ): Promise<ResponseDto<ProductOperationResponseDto>> {
        try{
            const userEntity = await this.userRepository.findOne({ where: { id: this.req.user.id, status: UserStatus.Active }, relations: ['cart', 'cart.products', 'cart.cartProducts']});
            if(!userEntity){
                throw new NotFoundException(`Your session might have ended or you might have been logged out. Login again to access the resource`);
            }
            const product = await this.productRepository.findOne({ where: { id: productId, status: In(this.statuses)}});
            if(!product){
                throw new NotFoundException(`The product you are trying to add to the cart is not available it might have been bought or expired`);
            }
            // const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey) || [];
            // const cachedProduct = all_products.find((product) => product.id === productId && this.statuses.includes(product.status));
            if(!userEntity.cart){
              console.log()
                const cart = await this.cartRepository.create({
                    product_count: 1,
                    sub_total: product.sale_price > 0 && product.sale_price ? product.sale_price : (
                      product.regular_price > 0 && product.regular_price ? product.regular_price : 0
                    ),
                    userId: userEntity.id,
                    products: [product]
                })
                const savedCart = await this.cartRepository.save(cart);
                const cartProduct = await this.cartProductRepository.create({
                  cart_status: ECartStatus.PENDING,
                  productId: product.id,
                  quantity: 1,
                  price: product.sale_price > 0 && product.sale_price ? product.sale_price : product.regular_price,
                  cartId: savedCart.id
                })

                await this.cartProductRepository.save(cartProduct);
                await this.productRepository.update(
                  product.id,
                  product.in_pair
                    ? !product.in_stock
                      ? { pair_quantity: Math.max(0, product.pair_quantity - 1) }
                      : { 
                        quantity: Math.max(0, product.quantity - 1),
                        ...(product.quantity - 1 <= 0 && { in_stock: false }),
                       }
                    : product.in_stock
                    ? { 
                      quantity: Math.max(0, product.quantity - 1),
                      ...(product.quantity - 1 <= 0 && { in_stock: false }),
                     }
                    : { status: EProductStatus.OFF_SALE, in_stock: false },
                );
                const updatedProduct = await this.productRepository.findOne({ 
                  where: { id: productId, status: In(this.statuses) }
                })
                const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey) || []
                const cachedProduct = all_products.find((product) => product.id === productId);
                if(cachedProduct){
                  await this.cacheService.update(this.cacheKey, product.id, updatedProduct);
                }else{
                  all_products.push(product)
                  await this.cacheService.set(this.cacheKey, all_products, this.cacheDuration);
                }
                return this.responseService.makeResponse({
                    message: `Product was added to the cart`,
                    payload: { product: ProductMapper.toProductOperation(updatedProduct) }
                })
            }
            const cartProducts = await userEntity.cart?.products || [];
            const productAlreadyInCart = cartProducts.find((product) => product.id === productId && this.statuses.includes(product.status)); 
            if(!productAlreadyInCart){
                const userCart = await userEntity.cart;
                userCart.products.push(product);
                userCart.product_count = userCart.products.length;
                console.log("the userCart initially is: " + userCart.sub_total);
                userCart.sub_total = product.sale_price > 0 && product.sale_price ? 
                product.sale_price + userCart.sub_total : 
                (
                  product.regular_price > 0 && product.regular_price ? product.regular_price + userCart.sub_total : userCart.sub_total + 0
                );
                const savedCart = await this.cartRepository.save(userCart);
                const cartProduct = await this.cartProductRepository.create({
                  cart_status: ECartStatus.PENDING,
                  productId: product.id,
                  quantity: 1,
                  cartId: savedCart.id,
                  price: product.sale_price > 0 && product.sale_price ? product.sale_price : (product.regular_price || 0)
                })
                await this.cartProductRepository.save(cartProduct);
                await this.productRepository.update(
                  product.id,
                  product.in_pair
                    ? !product.in_stock
                      ? { pair_quantity: Math.max(0, product.pair_quantity - 1) }
                      : { 
                        quantity: Math.max(0, product.quantity - 1),
                        ...(product.quantity - 1 <= 0 && { in_stock: false }),
                       }
                    : product.in_stock
                    ? { 
                      quantity: Math.max(0, product.quantity - 1),
                      ...(product.quantity - 1 <= 0 && { in_stock: false }),
                     }
                    : { status: EProductStatus.OFF_SALE, in_stock: false },
                );
                const updatedProduct = await this.productRepository.findOne({ where: { id: productId }});
                const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey) || [];
                const cachedProduct = all_products.find((product) => product.id === productId);
                if(cachedProduct){
                  await this.cacheService.update(this.cacheKey, product.id, updatedProduct);
                  // const updated_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey);
                  // const updated_product = updated_products.find((product) => product.id === productId);
                  // console.log("the updated product is: " + JSON.stringify(updated_product));
                }else{
                  all_products.push(product)
                  await this.cacheService.set(this.cacheKey, all_products, this.cacheDuration);
                }
                return this.responseService.makeResponse({
                    message: `Product was added to the cart`,
                    payload: { product: ProductMapper.toProductOperation(updatedProduct) }
                })
            }
            return this.responseService.makeResponse({
                message: `This product already exists in your cart`,
                payload: null
            })
        }catch(error){
          console.log("the error stack is: " + error.stack);
            if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
                throw new ConflictCustomException('Your cart has already been updated');
              }
              if (
                error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
                error.code == DBErrorCode.PgNotNullConstraintViolation
              ) {
                throw new BadRequestCustomException('Some errors are occuring while updating your cart');
              }
              if (error instanceof NotFoundException) {
                throw new NotFoundException(error);
              }
              if (error instanceof TimeoutError) {
                throw new RequestTimeoutException(`Request timed out check your internet connection`);
              } else {
                throw new InternalServerErrorException(`An unknown error occured while updating your job hold on!`);
              }
        }
    }
    
    async removeProductFromCart(
      productId: string
    ): Promise<ResponseDto<string>> {
      try{
        const userEntity = await this.userRepository.findOne({ where: { id: this.req.user.id, status: UserStatus.Active }, relations: ['cart', 'cart.products', 'cart.cartProducts']})
        if(!userEntity){
          throw new NotFoundException(`Your session might have ended login again to access this resource`);
        }
        const productExists = await userEntity.cart?.products.some((product) => product.id === productId);
        if(!productExists){
          throw new NotFoundException(`The product you selected might not be existing among your cart products add it to do this operation`);
        }
        const cartProduct = await userEntity.cart.cartProducts.find((cartProduct) => cartProduct.productId === productId);
        if(!cartProduct){
          throw new NotFoundException(`The product record for your cart was deleted from the cart add the product to cart to complete the purchase`);
        }
        const userCart = await userEntity.cart;
        const product = await this.productRepository.findOne({ where: { id: productId, status: In(this.statuses)}});
        userCart.products = userEntity.cart.products.filter((cart_product) => cart_product.id !== productId);
        userCart.product_count = userCart.products.length;
        userCart.sub_total -= cartProduct.price;
        await this.cartRepository.save(userCart);
        await this.productRepository.update(
          product.id,
          product.in_pair
            ? !product.in_stock
              ? { pair_quantity: Math.max(0, product.pair_quantity + cartProduct.quantity) }
              : { quantity: Math.max(0, product.quantity + cartProduct.quantity) }
            : product.in_stock
            ? { quantity: Math.max(0, product.quantity + cartProduct.quantity) }
            : { status: EProductStatus.ON_SALE },
        );
        const updatedProduct = await this.productRepository.findOne({
          where: { id: productId, status: In(this.statuses) }
        })
        const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey) || [];
        const cachedProduct = all_products.find((product) => product.id === productId && this.statuses.includes(product.status));
        if(!cachedProduct){
          all_products.push(updatedProduct);
          await this.cacheService.set(this.cacheKey, all_products, this.cacheDuration);
        }else{
          await this.cacheService.update(this.cacheKey, cachedProduct.id, updatedProduct);
        }
        await this.cartProductRepository.remove(cartProduct);
        return this.responseService.makeResponse({
          message: `Removed product from your cart`,
          payload: null
        })
      }catch(error){
        console.log("the error is: " + error.stack);
        if (error instanceof NotFoundException) {
          throw new NotFoundException(error);
        }
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException(`Request timed out check your internet connection`);
        } else {
          throw new InternalServerErrorException(`An unknown error occured while updating your job hold on!`);
        }
      }
    }

    async updatePairQuantity(
      id: string,
      dto: PairQuantityDto
    ): Promise<ResponseDto<string>> {
      try{
        const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey) || []
        let product = all_products.find((product) => product.id === id && this.statuses.includes(product.status));
        if(!product){
          product = await this.productRepository.findOne({
            where: { id, status: In(this.statuses) }
          })
        }
        const updatedProduct = ProductMapper.updatePairQuantity(product, dto);
        const savedProduct = await this.productRepository.save(updatedProduct);
        const cachedProduct = all_products.find((product) => product.id === id && this.statuses.includes(product.status));
        if(!cachedProduct){
          all_products.push(savedProduct)
        }else{
          await this.cacheService.update(product.id, cachedProduct.id, savedProduct);
        }
        return this.responseService.makeResponse({
          message: `Product quantity updated`,
          payload: null
        })
      }catch(error){
        console.log("the error stack is: " + error.stack);
        if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
          throw new ConflictCustomException('Your product has been updated');
        }
        if (
          error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
          error.code == DBErrorCode.PgNotNullConstraintViolation
        ) {
          throw new BadRequestCustomException('Some fields are missing while updating your product');
        }
        if (error instanceof NotFoundException) {
          throw new NotFoundException(`Your selected product might have been deleted`);
        }
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException(`Request timed out check your internet connection`);
        } else {
          throw new InternalServerErrorException(`An unknown error occured while updating your job hold on!`);
        }
      }
    }
    
    async updateCartQuantity(
      productId: string
    ): Promise<ResponseDto<string>> {
      try{
        const userEntity = await this.userRepository.findOne({ where: { id: this.req.user.id, status: UserStatus.Active }, relations: ['cart.products']});
        if(!userEntity){
          throw new NotFoundException(`Your session might have ended login again to access the resource`);
        }
        const isProductExist = await userEntity.cart?.products.some((product) => product.id === productId)
        if(!isProductExist){
          return this.responseService.makeResponse({
            message: `The product you requested was not found in your cart`,
            payload: null
          })
        }
        const productDatabase = await this.productRepository.findOne({ where: { id: productId, status: In(this.statuses)}});
        const product = await userEntity.cart?.products.find((product) => product.id === productId);
        const userCart = await userEntity.cart;
        const cartProduct = await userCart?.cartProducts.find((cart_product) => cart_product.productId === productId)
        if(!cartProduct){
          return this.responseService.makeResponse({
            message: `The requested product is not among your products`,
            payload: null
          })
        }
        cartProduct.quantity++;
        cartProduct.price += product.sale_price > 0 && product.sale_price ? 
        product.sale_price : (
          product.regular_price > 0 && product.regular_price ? product.regular_price : 0
        );
        userCart.sub_total += product.sale_price > 0 && product.sale_price ? 
        product.sale_price : (
          product.regular_price > 0 && product.regular_price ? product.regular_price : 0
        );
        await this.cartProductRepository.save(cartProduct);
        await this.cartRepository.save(userCart);
        await this.productRepository.update(
          productDatabase.id,
          productDatabase.in_pair
            ? !productDatabase.in_stock
              ? { pair_quantity: Math.max(0, productDatabase.pair_quantity - 1) }
              : { 
                quantity: Math.max(0, productDatabase.quantity - 1),
                ...(productDatabase.quantity - 1 <= 0 && { in_stock: false }),
               }
            : productDatabase.in_stock
            ? { 
              quantity: Math.max(0, productDatabase.quantity - 1),
              ...(productDatabase.quantity - 1 <= 0 && { in_stock: false }),
             }
            : { status: EProductStatus.OFF_SALE, in_stock: false },
        );
        const updatedProduct = await this.productRepository.findOne({ where: { id: productId, status: In(this.statuses) }});
        const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey);
        const final_product = all_products.find((product) => product.id === productId && this.statuses.includes(product.status));
        if(!final_product){
          all_products.push(updatedProduct);
          await this.cacheService.set(this.cacheKey, all_products, this.cacheDuration);
        }else{
          console.log("the updated product is: " + JSON.stringify(updatedProduct));
          console.log("this condition here was reached")
          await this.cacheService.update(this.cacheKey, final_product.id, updatedProduct);
        }
        return this.responseService.makeResponse({
          message: `Cart Product quantity updated`,
          payload: null
        })
      }catch(error){
        console.log("the error stack is: " + error.stack);
        if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
          throw new ConflictCustomException('Your product has been updated');
        }
        if (
          error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
          error.code == DBErrorCode.PgNotNullConstraintViolation
        ) {
          throw new BadRequestCustomException('Some fields are missing while updating your product');
        }
        if (error instanceof NotFoundException) {
          throw new NotFoundException(`Your selected product might have been deleted`);
        }
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException(`Request timed out check your internet connection`);
        } else {
          throw new InternalServerErrorException(`An unknown error occured while updating your job hold on!`);
        }
      }
    }

    async updateCartQuantityDecrease(
      productId: string
    ): Promise<ResponseDto<string>> {
      try{
        const userEntity = await this.userRepository.findOne({ where: { id: this.req.user.id, status: UserStatus.Active }, relations: ['cart.products']});
        if(!userEntity){
          throw new NotFoundException(`Your session might have ended login again to access the resource`);
        }
        const isProductExist = await userEntity.cart?.products.some((product) => product.id === productId)
        if(!isProductExist){
          throw new NotFoundException(`The product you requested was not found in your cart`);
        }
        const productDatabase = await this.productRepository.findOne({ where: { id: productId, status: In(this.statuses)}});
        const product = await userEntity.cart?.products.find((product) => product.id === productId);
        const userCart = await userEntity.cart;
        const cartProduct = await userCart?.cartProducts.find((cart_product) => cart_product.productId === productId)
        if(!cartProduct){
          throw new NotFoundException(`The cart product you requested was not found in your cart`);
        }
        if(!cartProduct){
          throw new NotFoundException(`Make sure the cart product you ar eupdating its already in the cart`);
        }
        cartProduct.quantity--;
        cartProduct.price -= product.sale_price > 0 && product.sale_price ? product.sale_price : product.regular_price;
        userCart.sub_total -= product.sale_price > 0 && product.sale_price ? product.sale_price : product.regular_price;
        await this.cartProductRepository.save(cartProduct);
        await this.cartRepository.save(userCart);
        await this.productRepository.update(
          productDatabase.id,
          productDatabase.in_pair
            ? !productDatabase.in_stock
              ? { pair_quantity: Math.max(0, productDatabase.pair_quantity + 1) }
              : { 
                quantity: Math.max(0, productDatabase.quantity + 1),
                ...(productDatabase.quantity + 1 > 0 && { in_stock: true }),
               }
            : productDatabase.in_stock
            ? { 
              quantity: Math.max(0, productDatabase.quantity - 1),
              ...(productDatabase.quantity + 1 > 0 && { in_stock: true }),
             }
            : { status: EProductStatus.OFF_SALE, in_stock: false },
        );
        const updatedProduct = await this.productRepository.findOne({ where: { id: productId, status: In(this.statuses) }});
        const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey);
        const final_product = all_products.find((product) => product.id === productId && this.statuses.includes(product.status));
        if(!final_product){
          all_products.push(updatedProduct);
          await this.cacheService.set(this.cacheKey, all_products, this.cacheDuration);
        }else{
          console.log("this condition here was reached");
          await this.cacheService.update(this.cacheKey, final_product.id, updatedProduct);
        }
        return this.responseService.makeResponse({
          message: `Cart Product quantity updated`,
          payload: null
        })
      }catch(error){
        console.log("the error stack is: " + error.stack);
        if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
          throw new ConflictCustomException('Your product has been updated');
        }
        if (
          error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
          error.code == DBErrorCode.PgNotNullConstraintViolation
        ) {
          throw new BadRequestCustomException('Some fields are missing while updating your product');
        }
        if (error instanceof NotFoundException) {
          throw new NotFoundException(`Your selected product might have been deleted`);
        }
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException(`Request timed out check your internet connection`);
        } else {
          throw new InternalServerErrorException(`An unknown error occured while updating your job hold on!`);
        }
      }
    }

    async viewCart(): Promise<ResponseDto<ViewCartResponseDto>> {
      try{
        const userEntity = await this.userRepository.findOne({ where: { id: this.req.user.id, status: UserStatus.Active }, relations: ['cart', 'cart.products', 'cart.cartProducts.product']});
        if(!userEntity){
          throw new NotFoundException(`Your session might have ended login again to access the resource`);
        }
        if(!userEntity.cart){
          return this.responseService.makeResponse({
            message: `you have not yet added any product to your cart`,
            payload: null
          })
        }
        if(!userEntity.cart.products){
          return this.responseService.makeResponse({
            message: `Your cart is empty add any product`,
            payload: { cart: null }
          })
        }
        const cartDto = await ProductMapper.toDtoCart(userEntity.cart);
        return this.responseService.makeResponse({
          message: `Your cart products`,
          payload: { cart: cartDto }
        })
      }catch(error){
        if (error instanceof NotFoundException) {
          throw new NotFoundException(`Seems like you dont have any cart products`);
        }
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException(`Request timed out check your internet connection`);
        } else {
          throw new InternalServerErrorException(`An unknown error occured while getting your cart products`);
        }
      }
    }

    async deleteProduct(
      productId: string
    ): Promise<ResponseDto<string>> {
      try{
        const product = await this.productRepository.findOne({
          where: { id: productId, status: In(this.statuses) }
        })
        if(!product){
          throw new NotFoundCustomException(`The product you are trying to delete was not found try again`);
        }
        await this.productRepository.update(
          product.id,
          { status: EProductStatus.DELETED }
        )
        const all_products = await this.cacheService.get<ProductGeneralEntity[]>(this.cacheKey) || [];
        const cachedProduct = all_products.find((product) => product.id === productId && this.statuses.includes(product.status));
        if(cachedProduct){
          await this.cacheService.delete(this.cacheKey, productId);
        }
        return this.responseService.makeResponse({
          message: `Product was deleted among the products`,
          payload: null
        })

      }catch(error){
        throw new CustomException(error);
      }
    }
}
import { CommonEntity } from "src/common/entities";
import { Entity, Column, ManyToMany, OneToMany } from 'typeorm';
import { EProductCategory } from "../enums/product-category.enum";
import { EProductStatus } from "../enums/roduct-status.enum";
import { EProductQuantityStatus } from "../enums/product-status-quantity.enum";
import { CartEntity } from "src/modules/cart/model/cart.entity";
import { CartProductEntity } from "src/modules/cart/model/cart-product.entity";
@Entity({ name: "product_general", schema: "products" })
export class ProductGeneralEntity extends CommonEntity {

    @Column({ nullable: false })
    product_name: string;

    @Column({ nullable: false, type: 'jsonb', default: ["None"] })
    short_description: string[];

    @Column({ nullable: true, type: 'jsonb', default: ["None"] })
    product_description: string[];

    @Column({ nullable: false })
    regular_price: number;

    @Column({ nullable: false })
    sale_price: number;

    @Column({ nullable: false })
    discount_price: number;

    @Column({ nullable: false, default: false })
    is_shceduled: boolean;

    @Column({ nullable: false, type: 'enum', enum: EProductCategory, default: EProductCategory.NONE })
    category: EProductCategory;

    @Column({ nullable: true, default: "None" })
    from_date: string;

    @Column({ nullable: true, default: "None" })
    to_date: string;

    @Column({ nullable: false })
    product_image: string;

    @Column({ nullable: true, type: 'jsonb', default: ["https://dummy.img.jpg"]})
    product_gallery: string[];

    @Column({ nullable: true, type: 'jsonb', default: ["None"] })
    tags: string[];

    @Column({ nullable: false, type: 'enum', enum: EProductQuantityStatus, default: EProductQuantityStatus.PAIR })
    in_pair: EProductQuantityStatus;

    @Column({ nullable: false, default: 0 })
    pair_quantity: number;

    @Column({ nullable: false })
    in_stock: boolean;

    @Column({ nullable: true, default: "None" })
    sku: string;

    @Column({ nullable: true, default: "None" })
    isbn: string;

    @Column({ nullable: true, default: 0 })
    quantity: number;

    @Column({ nullable: true, default: 0 })
    store_threshold: number;

    @Column({ nullable: false, type: 'enum', enum: EProductStatus, default: EProductStatus.ON_SALE })
    status: EProductStatus;

    @OneToMany(() => CartProductEntity, (cartProduct) => cartProduct.product, { eager: true, cascade: true })
    cartProducts: CartProductEntity[];

    @ManyToMany(() => CartEntity, (cart) => cart.products)
    carts: CartEntity[]

}
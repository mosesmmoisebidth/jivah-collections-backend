import { CommonEntity } from "src/common/entities";
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { ECartStatus } from "../enums/cart-status.enum";
import { CartEntity } from "./cart.entity";
import { ProductGeneralEntity } from "src/modules/product/model/product-general.entity";

@Entity({ name: "cart_product_link", schema: "products" })
export class CartProductEntity extends CommonEntity {

    @Column({ nullable: false, type: 'enum', enum: ECartStatus, default: ECartStatus.PENDING })
    cart_status: ECartStatus;

    @Column({ nullable: false, default: 0 })
    quantity: number;

    @Column({ nullable: false, default: 0 })
    price: number;

    @Column({ nullable: false })
    productId: string;

    @Column({ nullable: false })
    cartId: string;

    @ManyToOne(() => CartEntity, (cart) => cart.cartProducts)
    @JoinColumn({ name: "cartId" })
    cart: CartEntity;

    @ManyToOne(() => ProductGeneralEntity, (product) => product.cartProducts)
    @JoinColumn({ name: "productId" })
    product: ProductGeneralEntity;

}
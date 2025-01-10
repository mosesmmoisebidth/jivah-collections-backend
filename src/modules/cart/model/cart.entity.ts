import { CommonEntity } from "src/common/entities";
import { OneToOne, ManyToMany, JoinTable, Entity, JoinColumn, Column, OneToMany } from 'typeorm';
import { UserEntity } from "src/modules/users/model/users.entity";
import { ProductGeneralEntity } from "src/modules/product/model/product-general.entity";
import { CartProductEntity } from "./cart-product.entity";

@Entity({ name: "cart", schema: "products" })
export class CartEntity extends CommonEntity {

    @Column({ nullable: false, default: 0 })
    product_count: number;

    @Column({ nullable: false, default: 0 })
    sub_total: number;

    @Column({ nullable: false })
    userId: string;

    @OneToOne(() => UserEntity, (user) => user.cart, { eager: true, cascade: true })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @OneToMany(() => CartProductEntity, (cartProduct) => cartProduct.cart, { eager: true, cascade: true })
    cartProducts: CartProductEntity[];

    @ManyToMany(() => ProductGeneralEntity, (product) => product.carts, { eager: true, cascade: true })
    @JoinTable({
        schema: "products",
        name: "cart_product",
        joinColumn: {
            name: 'cartId',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'productId',
            referencedColumnName: 'id'
        }
    })
    products: ProductGeneralEntity[];
}
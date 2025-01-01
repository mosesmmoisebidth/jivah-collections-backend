import { CommonEntity } from "src/common/entities";
import { Entity, Column, OneToOne } from "typeorm";
import { ProductGeneralEntity } from "../../model/product-general.entity";

@Entity({ name: "shipping_entity", schema: "products" })
export class ShippingEntity extends CommonEntity {

    @Column({ nullable: false, default: 0 })
    weight: number;

    @Column({ nullable: true, default: 0 })
    length: number;

    @Column({ nullable: true, default: 0 })
    width: number;

    @Column({ nullable: true, default: "None" })
    shipping_class: string;

    @OneToOne(() => ProductGeneralEntity, (product) => product.shipping)
    product: ProductGeneralEntity;
}
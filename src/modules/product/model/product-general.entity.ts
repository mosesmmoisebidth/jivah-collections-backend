import { CommonEntity } from "src/common/entities";
import { Entity, Column, OneToOne } from 'typeorm';
import { EProductCategory } from "../enums/product-category.enum";
import { ShippingEntity } from "../shipping/model/shipping.entity";
import { InventoryEntity } from "../inventory/model/inventory.entity";

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

    @OneToOne(() => ShippingEntity, (shipping) => shipping.product, { eager: true, cascade: true })
    shipping: ShippingEntity;

    @OneToOne(() => InventoryEntity, (inventory) => inventory.product, { eager: true, cascade: true })
    inventory: InventoryEntity;


}
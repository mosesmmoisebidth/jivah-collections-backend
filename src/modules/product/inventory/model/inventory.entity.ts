import { CommonEntity } from "src/common/entities";
import { Entity, Column, OneToOne } from 'typeorm';
import { EBackOrders } from "../../enums/backorders.enum";
import { ProductGeneralEntity } from "../../model/product-general.entity";

@Entity({ name: "inventory", schema: "products" })
export class InventoryEntity extends CommonEntity {

    @Column({ nullable: true, default: "None" })
    sku: string;

    @Column({ nullable: true, default: "None" })
    isbn: string;

    @Column({ nullable: false, default: false })
    track_stock: boolean;

    @Column({ nullable: true, default: 0 })
    quantity: number;

    @Column({ nullable: true, default: 0 })
    store_threshold: number;

    @Column({ nullable: true, type: 'enum', enum: EBackOrders, default: EBackOrders.DO_NOT_ALLOW })
    allow_backorders: EBackOrders;

    @OneToOne(() => ProductGeneralEntity, (product) => product.inventory)
    product: ProductGeneralEntity;
    
}
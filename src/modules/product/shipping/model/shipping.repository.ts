import { Injectable } from "@nestjs/common";
import { ShippingEntity } from "./shipping.entity";
import { Repository, DataSource } from "typeorm";

@Injectable()
export class InventoryRepository extends Repository<ShippingEntity> {
  constructor(private dataSource: DataSource) {
    super(ShippingEntity, dataSource.createEntityManager());
  }
}
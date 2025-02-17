import { CommonEntity } from "src/common/entities";
import { Column, Entity } from 'typeorm';

@Entity({ name: "payment", schema: "payments" })
export class PaymentEntity extends CommonEntity {

    @Column({ nullable: false, default: "None" })
    transaction_id: string;

    @Column({ nullable: false, default: "None" })
    merchant_code: string;

    @Column({ nullable: false, default: "None" })
    payer_code: string;

    @Column({ nullable: false, default: "None" })
    academic_year: string;

    @Column({ nullable: false, default: "None" })
    payment_channel: string;

    @Column({ nullable: false, default: "None" })
    payment_channel_name: string;

    @Column({ nullable: false, default: "None" })
    bank_name: string;

    @Column({ nullable: false, default: "None" })
    bank_account: string;

    @Column({ nullable: false, default: "None" })
    payment_purpose: string;

    @Column({ nullable: false, default: "None"})
    amount: string;

    @Column({ nullable: false, default: "None"})
    currency: string;

    @Column({ nullable: false, default: "None" })
    term: string;

    @Column({ nullable: false, default: "None" })
    observation: string;

    @Column({ nullable: false, default: "None" })
    initial_slip_number: string;

    @Column({ nullable: false, default: "None" })
    slip_number: string;

}
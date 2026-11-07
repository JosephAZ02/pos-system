import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { decimalTransformer } from '../../../common/transformers/decimal.transformer';
import { SaleItem } from './sale-item.entity';

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    TRANSFER = 'TRANSFER',
}

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
    items: SaleItem[];

    @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
    subtotal: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
    tax: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
    total: number;

    @Column({ type: 'enum', enum: PaymentMethod })
    paymentMethod: PaymentMethod;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
    amountPaid: number | null;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
    changeAmount: number | null;

    @CreateDateColumn()
    createdAt: Date;
}

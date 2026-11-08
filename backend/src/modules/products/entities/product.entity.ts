import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {decimalTransformer} from '../../../common/transformers/decimal.transformer';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, length: 50})
    sku: string;

    @Column({length: 150})
    name: string;

    @Column({type: 'text', nullable: true})
    description: string | null;

    @Column({length: 100})
    category: string;

    @Column({type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer})
    purchasePrice: number;

    @Column({type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer})
    salePrice: number;

    @Column({type: 'int', default: 0})
    stock: number;

    @Column({type: 'int', default: 0})
    minStock: number;

    @Column({default: true})
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

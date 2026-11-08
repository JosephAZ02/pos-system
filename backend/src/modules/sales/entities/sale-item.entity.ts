import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Product} from '../../products/entities/product.entity';
import {decimalTransformer} from '../../../common/transformers/decimal.transformer';
import {Sale} from './sale.entity';

@Entity('sale_items')
export class SaleItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    saleId: number;

    @ManyToOne(() => Sale, (sale) => sale.items, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'saleId'})
    sale: Sale;

    @Column()
    productId: number;

    @ManyToOne(() => Product)
    @JoinColumn({name: 'productId'})
    product: Product;

    @Column({length: 50})
    productCode: string;

    @Column({length: 150})
    productName: string;

    @Column({type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer})
    unitPrice: number;

    @Column({type: 'int'})
    quantity: number;

    @Column({type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer})
    lineTotal: number;
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { SaleDto } from '@pos/shared';
import { Product } from '../products/entities/product.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaymentMethod, Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';

const TAX_RATE = 0.13;//iva al 13%

const toCents = (value: number) => Math.round(value * 100);//colones a céntimos como 15000.50 a 150050
const fromCents = (cents: number) => cents / 100; //lo contrario 

@Injectable()
export class SalesService {
    constructor(//inyeccion de dependencias de la conexion con la base de datos 
        //y repo de la tabla de venta 
        private readonly dataSource: DataSource,
        @InjectRepository(Sale) private readonly salesRepository: Repository<Sale>,
    ) { }

    async create(dto: CreateSaleDto, userId: number): Promise<SaleDto> {//recibe venta y el usuario que la creo 

        const saleId = await this.dataSource.transaction(async (manager) => {
            const items: SaleItem[] = [];
            let subtotalCents = 0;

            for (const item of dto.items) {//recorre cada item del carrito 
                const product = await manager.findOne(Product, {//busca el producto 
                    where: { id: item.productId },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!product || !product.isActive) {
                    throw new NotFoundException(`Producto #${item.productId} no existe o está inactivo`);
                }

                if (product.stock < item.quantity) {
                    throw new BadRequestException(
                        `Stock insuficiente para ${product.name} (disponible: ${product.stock})`,
                    );
                }

                product.stock -= item.quantity;//se le descuenta 
                await manager.save(product);//guarda

                const unitPriceCents = toCents(product.salePrice);//convierte el precio de la base de datos 
                const lineTotalCents = unitPriceCents * item.quantity;//calcular el total 
                subtotalCents += lineTotalCents;//se le suma al subtotal

                items.push(//crea el objeto 
                    manager.create(SaleItem, {
                        productId: product.id,
                        productCode: product.sku,
                        productName: product.name,
                        unitPrice: fromCents(unitPriceCents),
                        quantity: item.quantity,
                        lineTotal: fromCents(lineTotalCents),
                    }),
                );
            }

            const taxCents = Math.round(subtotalCents * TAX_RATE);// el iva 
            const totalCents = subtotalCents + taxCents;// subtotal más el iva 

            let amountPaid: number | null = null;//pago
            let changeAmount: number | null = null;//cambio

            if (dto.paymentMethod === PaymentMethod.CASH) {
                if (dto.amountPaid === undefined || toCents(dto.amountPaid) < totalCents) {
                    throw new BadRequestException(
                        `El monto pagado debe ser al menos el total (${fromCents(totalCents)})`,
                    );
                }
                amountPaid = dto.amountPaid;//se guarda el pago 
                changeAmount = fromCents(toCents(dto.amountPaid) - totalCents);//calcula el vuelto 
            }

            const sale = manager.create(Sale, {
                userId,
                items,
                subtotal: fromCents(subtotalCents),
                tax: fromCents(taxCents),
                total: fromCents(totalCents),
                paymentMethod: dto.paymentMethod,
                amountPaid,
                changeAmount,
            });

            const saved = await manager.save(sale);//se guarda 
            return saved.id;//devuelve el ide de la nueva venta
        });

        return this.findOneSale(saleId);
    }

    async findOneSale(id: number): Promise<SaleDto> {//busca una venta
        const sale = await this.salesRepository.findOne({
            where: { id },
            relations: { items: true, user: true },
        });

        if (!sale) {
            throw new NotFoundException(`Venta #${id} no existe`);
        }

        return this.toDto(sale);
    }

    private toDto(sale: Sale): SaleDto {//crear la venta con la forma que espera el front 
        return {
            id: sale.id,
            userId: sale.userId,
            cashierName: sale.user.name,
            items: sale.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                productCode: item.productCode,
                productName: item.productName,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                lineTotal: item.lineTotal,
            })),
            subtotal: sale.subtotal,
            tax: sale.tax,
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            amountPaid: sale.amountPaid,
            changeAmount: sale.changeAmount,
            createdAt: sale.createdAt,
        };
    }
}

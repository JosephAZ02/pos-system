import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
  ) {}

  async getSummary(filterDto: DashboardFilterDto) {
    const { startDate, endDate } = filterDto;

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // 1. Resumen de Ventas
    const salesCount = await this.saleRepository.count({
      where: { createdAt: Between(start, end) },
    });

    const salesTotalResult = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalRevenue')
      .where('sale.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();

    // 2. Resumen de Productos
    const totalProducts = await this.productRepository.count();

    const lowStockProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= :minStock', { minStock: 5 })
      .getCount();

    return {
      period: { start, end },
      sales: {
        totalOrders: salesCount,
        totalRevenue: parseFloat(salesTotalResult?.totalRevenue || '0'),
      },
      products: {
        totalProducts,
        lowStockProducts,
      },
    };
  }

  async getTopSellingProducts(limit: number = 5, filterDto?: DashboardFilterDto) {
    const query = this.saleItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.sale', 'sale')
      .select('item.productId', 'productId')
      .addSelect('item.productCode', 'productCode')
      .addSelect('item.productName', 'productName')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.lineTotal)', 'totalAmount')
      .groupBy('item.productId')
      .addGroupBy('item.productCode')
      .addGroupBy('item.productName')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(limit);

    if (filterDto?.startDate && filterDto?.endDate) {
      const start = new Date(filterDto.startDate);
      const end = new Date(filterDto.endDate);
      query.where('sale.createdAt BETWEEN :start AND :end', { start, end });
    }

    const rawData = await query.getRawMany();

    return rawData.map((row) => ({
      productId: Number(row.productId),
      productCode: row.productCode,
      productName: row.productName,
      totalQuantity: Number(row.totalQuantity || 0),
      totalAmount: parseFloat(row.totalAmount || '0'),
    }));
  }
}   
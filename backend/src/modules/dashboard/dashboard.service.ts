import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

function parseStartDate(value: string): Date {
  if (value.length === 10) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}

function parseEndDate(value: string): Date {
  if (value.length === 10) {
    return new Date(`${value}T23:59:59.999Z`);
  }
  return new Date(value);
}

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

  private async getSalesMetrics(start: Date, end: Date) {
    const totalOrders = await this.saleRepository.count({
      where: { createdAt: Between(start, end) },
    });

    const totalResult = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalRevenue')
      .where('sale.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();

    return {
      totalOrders,
      totalRevenue: parseFloat(totalResult?.totalRevenue || '0'),
    };
  }

  async getSummary(filterDto: DashboardFilterDto) {
    const { startDate, endDate } = filterDto;
    const now = new Date();

    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

    const start = startDate ? parseStartDate(startDate) : startOfMonth;
    const end = endDate ? parseEndDate(endDate) : endOfToday;

    const [periodSales, todaySales, monthSales, totalProducts, lowStockProducts] = await Promise.all([
      this.getSalesMetrics(start, end),
      this.getSalesMetrics(startOfToday, endOfToday),
      this.getSalesMetrics(startOfMonth, endOfToday),
      this.productRepository.count({ where: { isActive: true } }),
      this.productRepository
        .createQueryBuilder('product')
        .where('product.stock <= product.minStock')
        .andWhere('product.isActive = :isActive', { isActive: true })
        .getCount(),
    ]);

    return {
      period: { start, end },
      sales: periodSales,
      today: todaySales,
      month: monthSales,
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

    if (filterDto?.startDate) {
      query.andWhere('sale.createdAt >= :start', {
        start: parseStartDate(filterDto.startDate),
      });
    }

    if (filterDto?.endDate) {
      query.andWhere('sale.createdAt <= :end', {
        end: parseEndDate(filterDto.endDate),
      });
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

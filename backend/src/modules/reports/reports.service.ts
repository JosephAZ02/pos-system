import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { ReportFilterDto } from './dto/report-filter.dto';

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
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
  ) {}

  // 1. Reporte detallado de ventas por rango de fechas
  async getSalesReport(filterDto: ReportFilterDto) {
    const { startDate, endDate } = filterDto;

    const now = new Date();
    const defaultStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const defaultEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const start = startDate ? parseStartDate(startDate) : defaultStart;
    const end = endDate ? parseEndDate(endDate) : defaultEnd;

    const sales = await this.saleRepository.find({
      where: { createdAt: Between(start, end) },
      relations: {
        items: true,
        user: true,
      },
      order: { createdAt: 'DESC' },
    });

    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total || 0), 0);
    const totalSalesCount = sales.length;

    return {
      period: { start, end },
      summary: {
        totalSalesCount,
        totalRevenue,
      },
      data: sales,
    };
  }

  // 2. Reporte general de inventario / productos
  async getInventoryReport() {
    const products = await this.productRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const totalProducts = products.length;
    const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

    const totalInventoryCostValue = products.reduce(
      (acc, p) => acc + Number(p.purchasePrice || 0) * Number(p.stock || 0),
      0,
    );

    const totalInventorySaleValue = products.reduce(
      (acc, p) => acc + Number(p.salePrice || 0) * Number(p.stock || 0),
      0,
    );

    return {
      summary: {
        totalProducts,
        lowStockCount,
        totalInventoryCostValue,
        totalInventorySaleValue,
      },
      data: products,
    };
  }

  // 3. Reporte de productos más vendidos
  async getTopProductsReport(filterDto: ReportFilterDto) {
    const { startDate, endDate } = filterDto;

    const query = this.saleItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.sale', 'sale')
      .select('item.productId', 'productId')
      .addSelect('item.productCode', 'productCode')
      .addSelect('item.productName', 'productName')
      .addSelect('SUM(item.quantity)', 'totalQuantitySold')
      .addSelect('SUM(item.lineTotal)', 'totalRevenue')
      .groupBy('item.productId')
      .addGroupBy('item.productCode')
      .addGroupBy('item.productName')
      .orderBy('SUM(item.quantity)', 'DESC');

    if (startDate) {
      query.andWhere('sale.createdAt >= :start', { start: parseStartDate(startDate) });
    }

    if (endDate) {
      query.andWhere('sale.createdAt <= :end', { end: parseEndDate(endDate) });
    }

    const rawData = await query.getRawMany();

    return rawData.map((row) => ({
      productId: Number(row.productId),
      productCode: row.productCode,
      productName: row.productName,
      totalQuantitySold: Number(row.totalQuantitySold || 0),
      totalRevenue: parseFloat(row.totalRevenue || '0'),
    }));
  }
}

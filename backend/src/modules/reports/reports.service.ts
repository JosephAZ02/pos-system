import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { ReportFilterDto } from './dto/report-filter.dto';

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
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

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

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      query.where('sale.createdAt BETWEEN :start AND :end', { start, end });
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
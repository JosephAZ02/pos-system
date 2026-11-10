import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Sale, SaleItem]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
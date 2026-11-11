import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Sale, SaleItem]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
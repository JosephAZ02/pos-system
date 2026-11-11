import {Controller, Get, Query} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {ReportsService} from './reports.service';
import {ReportFilterDto} from './dto/report-filter.dto';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
//@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {
    }

    @Get('sales')
    //@RequirePermissions('reports.read')
    getSalesReport(@Query() filterDto: ReportFilterDto) {
        return this.reportsService.getSalesReport(filterDto);
    }

    @Get('inventory')
    //@RequirePermissions('reports.read')
    getInventoryReport() {
        return this.reportsService.getInventoryReport();
    }

    @Get('top-products')
    //@RequirePermissions('reports.read')
    getTopProductsReport(@Query() filterDto: ReportFilterDto) {
        return this.reportsService.getTopProductsReport(filterDto);
    }
}
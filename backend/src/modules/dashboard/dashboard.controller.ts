import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {DashboardService} from './dashboard.service';
import {DashboardFilterDto} from './dto/dashboard-filter.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';


@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {
    }

    @Get('summary')
    @RequirePermissions('dashboard.read')
    getSummary(@Query() filterDto: DashboardFilterDto) {
        return this.dashboardService.getSummary(filterDto);
    }

    @Get('top-products')
    @RequirePermissions('dashboard.read')
    getTopProducts(
        @Query('limit') limit?: number,
        @Query() filterDto?: DashboardFilterDto,
    ) {
        const parsedLimit = limit ? Number(limit) : 5;
        return this.dashboardService.getTopSellingProducts(parsedLimit, filterDto);
    }
}
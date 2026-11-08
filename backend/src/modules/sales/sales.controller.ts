import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

interface AuthenticatedRequest {
    user: { userId: number };
}

@Controller('sales')// todas las rutas con /api/sales
@UseGuards(JwtAuthGuard, PermissionsGuard)//aplica los guards
export class SalesController {
    constructor(private readonly salesService: SalesService) { }//inyecta el service 

    @Post()
    @RequirePermissions('sales.create')//crea el permiso 
    create(@Body() dto: CreateSaleDto, @Req() req: AuthenticatedRequest) {
        return this.salesService.create(dto, req.user.userId);
    }

    @Get(':id')// /api/sales/{id}
    @RequirePermissions('sales.read')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.salesService.findOneSale(id);
    }
}

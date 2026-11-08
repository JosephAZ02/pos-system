import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards,} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {ProductService} from './product.service';
import {CreateProductDto} from './dto/create-product.dto';
import {UpdateProductDto} from './dto/update-product.dto';
/*
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {PermissionsGuard} from '../../common/guards/permissions.guard';
import {RequirePermissions} from '../../common/decorators/require-permissions.decorator';
*/

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
//@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) {
    }

    @Post()
    //@RequirePermissions('products.create')
    create(@Body() request: CreateProductDto) {
        return this.productService.save(request);
    }

    @Get()
    //@RequirePermissions('products.read')
    getAll() {
        return this.productService.getAll();
    }

    @Get(':id')
    //@RequirePermissions('products.read')
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.productService.getById(id);
    }

    @Patch(':id')
    //@RequirePermissions('products.update')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: UpdateProductDto,
    ) {
        return this.productService.update(id, request);
    }

    @Delete(':id')
    //@RequirePermissions('products.delete')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productService.remove(id);
    }
}
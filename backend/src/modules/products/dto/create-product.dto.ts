import {IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min} from 'class-validator';
import {ICreateProductDto} from "@pos/shared/src/dto/product/icreateproduct.dto";
import {ApiProperty} from "@nestjs/swagger";


export class CreateProductDto implements ICreateProductDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty({message: 'El SKU no puede estar vacio'})
    @MaxLength(50)
    sku: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({message: 'El nombre no puede estar vacio'})
    @MaxLength(150)
    name: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({message: 'La categoría no puede estar vacia'})
    category: string;

    @ApiProperty()
    @IsNumber({}, {message: 'El precio de compra debe ser un número'})
    @Min(0, {message: 'El precio de compra no puede ser negativo'})
    purchasePrice: number;

    @ApiProperty()
    @IsNumber({}, {message: 'El precio de venta debe ser un número'})
    @Min(0, {message: 'El precio de venta no puede ser negativo'})
    salePrice: number;

    @ApiProperty()
    @IsNumber({}, {message: 'El stock debe ser un número entero'})
    @Min(0)
    stock: number;

    @ApiProperty()
    @IsNumber({}, {message: 'El stock mínimo debe ser un número entero'})
    @Min(0)
    minStock: number;
}
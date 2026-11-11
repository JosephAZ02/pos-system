import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator';
import type { CreateSaleItemRequest, CreateSaleRequest } from '@pos/shared';
import { PaymentMethod } from '../entities/sale.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleItemDto implements CreateSaleItemRequest {
    @IsInt()
    @Min(1)
    productId: number;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateSaleDto implements CreateSaleRequest {
    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateSaleItemDto)
    items: CreateSaleItemDto[];

    @ApiProperty()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;


    @ApiProperty()
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    amountPaid?: number;
}

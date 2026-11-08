import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator';
import type { CreateSaleItemRequest, CreateSaleRequest } from '@pos/shared';
import { PaymentMethod } from '../entities/sale.entity';

export class CreateSaleItemDto implements CreateSaleItemRequest {
    @IsInt()
    @Min(1)
    productId: number;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateSaleDto implements CreateSaleRequest {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateSaleItemDto)
    items: CreateSaleItemDto[];

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    amountPaid?: number;
}

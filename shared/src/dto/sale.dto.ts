export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export interface SaleItemDto {
    id: number;
    productId: number;
    productSku: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface SaleDto {
    id: number;
    userId: number;
    cashierName: string;
    items: SaleItemDto[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    amountPaid: number | null;
    changeAmount: number | null;
    createdAt: Date;
}

export interface IProductDto {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    category: string;
    purchasePrice: number;
    salePrice: number;
    stock: number;
    minStock: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

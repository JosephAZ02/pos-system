export interface ICreateProductDto {
    sku: string;
    name: string;
    description?: string;
    category: string;
    purchasePrice: number;
    salePrice: number;
    stock: number;
    minStock: number;
}
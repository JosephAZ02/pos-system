export interface ICreateProductDto {
    sku: string;
    name: string;
    description?: string;
    imageUrl?: string | null;
    category: string;
    purchasePrice: number;
    salePrice: number;
    stock: number;
    minStock: number;
}
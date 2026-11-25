import { api } from './auth/api';
import type { ICreateProductDto, IProductDto, IUpdateProductDto } from '@pos/shared';

export async function getProducts(activeOnly: boolean = true): Promise<IProductDto[]> {
    const response = await api.get<IProductDto[]>('/products');

    if (activeOnly) {
        return response.data.filter((product) => product.isActive);
    }

    return response.data;
}

export async function getProductById(id: number): Promise<IProductDto> {
    const response = await api.get<IProductDto>(`/products/${id}`);
    return response.data;
}

export async function createProduct(product: ICreateProductDto): Promise<IProductDto> {
    const response = await api.post<IProductDto>('/products', product);
    return response.data;
}

export async function updateProduct(id: number, product: IUpdateProductDto): Promise<IProductDto> {
    const response = await api.patch<IProductDto>(`/products/${id}`, product);
    return response.data;
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
}

import { api } from './auth/api';
import type { IProductDto } from '@pos/shared';

export const getProducts = async (): Promise<IProductDto[]> => {
    const { data } = await api.get<IProductDto[]>('/products');
    return data;
};

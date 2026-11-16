import { api } from './auth/api';
import type { CreateSaleRequest, SaleDto } from '@pos/shared';

export const createSale = async (sale: CreateSaleRequest): Promise<SaleDto> => {
    const { data } = await api.post<SaleDto>('/sales', sale);
    return data;
};

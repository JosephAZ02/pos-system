import {api} from './auth/api';

export interface DashboardFilterParams {
    startDate?: string;
    endDate?: string;
}

export interface SalesMetrics {
    totalOrders: number;
    totalRevenue: number;
}

export interface DashboardSummary {
    period: {
        start: string;
        end: string;
    };
    sales: SalesMetrics;
    today: SalesMetrics;
    month: SalesMetrics;
    products: {
        totalProducts: number;
        lowStockProducts: number;
    };
}

export interface DashboardTopProduct {
    productId: number;
    productCode: string;
    productName: string;
    totalQuantity: number;
    totalAmount: number;
}

export async function getDashboardSummary(params?: DashboardFilterParams): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/dashboard/summary', {params});
    return response.data;
}

export async function getDashboardTopProducts(
    limit: number = 5,
    params?: DashboardFilterParams,
): Promise<DashboardTopProduct[]> {
    const response = await api.get<DashboardTopProduct[]>('/dashboard/top-products', {
        params: {
            ...params,
            limit,
        },
    });
    return response.data;
}

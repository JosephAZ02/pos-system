import {api} from './auth/api';

export interface ReportFilterParams {
    startDate?: string;
    endDate?: string;
}

export interface SaleReportItem {
    id: number | string;
    createdAt: string;
    total: number;
    paymentMethod?: string;
    user?: {
        id?: number | string;
        name?: string;
        email?: string;
    };
    items?: Array<{
        id?: number | string;
        productName?: string;
        quantity?: number;
        lineTotal?: number;
    }>;
}

export interface SalesReportResponse {
    period: {
        start: string;
        end: string;
    };
    summary: {
        totalSalesCount: number;
        totalRevenue: number;
    };
    data: SaleReportItem[];
}

export interface InventoryProductItem {
    id: number | string;
    sku?: string;
    code?: string;
    name: string;
    stock: number;
    minStock: number;
    purchasePrice: number;
    salePrice: number;
    isActive?: boolean;
}

export interface InventoryReportResponse {
    summary: {
        totalProducts: number;
        lowStockCount: number;
        totalInventoryCostValue: number;
        totalInventorySaleValue: number;
    };
    data: InventoryProductItem[];
}

export interface TopProductItem {
    productId: number;
    productCode: string;
    productName: string;
    totalQuantitySold: number;
    totalRevenue: number;
}

const cleanParams = (params?: ReportFilterParams) => {
    if (!params) return undefined;
    const filtered: Record<string, string> = {};
    if (params.startDate) filtered.startDate = params.startDate;
    if (params.endDate) filtered.endDate = params.endDate;
    return Object.keys(filtered).length > 0 ? filtered : undefined;
};

export const getSalesReport = async (
    params?: ReportFilterParams,
): Promise<SalesReportResponse> => {
    const {data} = await api.get<SalesReportResponse>('/reports/sales', {
        params: cleanParams(params),
    });
    return data;
};

export const getInventoryReport = async (): Promise<InventoryReportResponse> => {
    const {data} = await api.get<InventoryReportResponse>('/reports/inventory');
    return data;
};

export const getTopProductsReport = async (
    params?: ReportFilterParams,
): Promise<TopProductItem[]> => {
    const {data} = await api.get<TopProductItem[]>('/reports/top-products', {
        params: cleanParams(params),
    });
    return data;
};
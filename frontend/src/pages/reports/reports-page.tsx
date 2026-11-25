import {useCallback, useEffect, useMemo, useState} from 'react';
import toast from 'react-hot-toast';
import {getErrorMessage} from '../../services/auth/api';
import {
    getInventoryReport,
    getSalesReport,
    getTopProductsReport,
    type InventoryReportResponse,
    type SalesReportResponse,
    type TopProductItem,
} from '../../services/reports.service';

type ReportTab = 'sales' | 'inventory' | 'top-products';

const PAYMENT_LABELS: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'SINPE',
};

const formatCurrency = (amount: number): string => {
    const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    return `₡${value.toLocaleString('es-CR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
};

const formatDateTime = (value?: string): string => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('es-CR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

const toInputDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ReportsPage = () => {
    const now = useMemo(() => new Date(), []);
    const defaultStart = useMemo(
        () => toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        [now],
    );
    const defaultEnd = useMemo(() => toInputDate(now), [now]);

    const [activeTab, setActiveTab] = useState<ReportTab>('sales');
    const [startDate, setStartDate] = useState<string>(defaultStart);
    const [endDate, setEndDate] = useState<string>(defaultEnd);
    const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [salesReport, setSalesReport] = useState<SalesReportResponse | null>(null);
    const [inventoryReport, setInventoryReport] = useState<InventoryReportResponse | null>(null);
    const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);

    const loadReports = useCallback(async () => {
        if (startDate && endDate && startDate > endDate) {
            toast.error('La fecha inicial no puede ser mayor que la fecha final.');
            return;
        }

        setLoading(true);
        try {
            const filters = {
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            };

            const [salesRes, inventoryRes, topRes] = await Promise.all([
                getSalesReport(filters),
                getInventoryReport(),
                getTopProductsReport(filters),
            ]);

            setSalesReport(salesRes);
            setInventoryReport(inventoryRes);
            setTopProducts(Array.isArray(topRes) ? topRes : []);
        } catch (error: unknown) {
            console.error('Error al cargar reportes:', error);
            toast.error(getErrorMessage(error, 'No se pudieron cargar los reportes.'));
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const applyPresetRange = (preset: 'today' | 'week' | 'month') => {
        const today = new Date();
        const endStr = toInputDate(today);
        if (preset === 'today') {
            setStartDate(endStr);
            setEndDate(endStr);
        } else if (preset === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            setStartDate(toInputDate(weekAgo));
            setEndDate(endStr);
        } else {
            setStartDate(toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)));
            setEndDate(endStr);
        }
    };

    const filteredInventory = useMemo(() => {
        const items = inventoryReport?.data ?? [];
        if (!onlyLowStock) return items;
        return items.filter((item) => Number(item.stock) <= Number(item.minStock));
    }, [inventoryReport, onlyLowStock]);

    const handleExportCsv = () => {
        let rows: string[][] = [];
        const filename = `reporte-${activeTab}.csv`;

        if (activeTab === 'sales') {
            rows = [
                ['ID', 'Fecha', 'Cajero', 'Metodo de Pago', 'Articulos', 'Total (CRC)'],
                ...(salesReport?.data ?? []).map((sale) => [
                    String(sale.id),
                    formatDateTime(sale.createdAt),
                    sale.user?.name || sale.user?.email || 'No asignado',
                    PAYMENT_LABELS[sale.paymentMethod ?? ''] || sale.paymentMethod || '—',
                    String(sale.items?.length ?? 0),
                    String(sale.total ?? 0),
                ]),
            ];
        } else if (activeTab === 'inventory') {
            rows = [
                ['SKU', 'Producto', 'Stock', 'Stock Minimo', 'Costo Unit.', 'Precio Venta'],
                ...filteredInventory.map((prod) => [
                    prod.sku || prod.code || String(prod.id),
                    prod.name,
                    String(prod.stock),
                    String(prod.minStock),
                    String(prod.purchasePrice ?? 0),
                    String(prod.salePrice ?? 0),
                ]),
            ];
        } else {
            rows = [
                ['Codigo', 'Producto', 'Unidades Vendidas', 'Ingresos (CRC)'],
                ...topProducts.map((item) => [
                    item.productCode || String(item.productId),
                    item.productName,
                    String(item.totalQuantitySold),
                    String(item.totalRevenue),
                ]),
            ];
        }

        if (rows.length <= 1) {
            toast('No hay datos para exportar.', {icon: 'ℹ️'});
            return;
        }

        const csvContent = rows
            .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('CSV descargado correctamente.');
    };

    return (
        <div className="container-fluid py-4">
            {/* Encabezado */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <span className="text-uppercase small fw-semibold text-primary">
                        Análisis y control
                    </span>
                    <h1 className="h3 mb-0 fw-bold">Reportes</h1>
                </div>

                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={loadReports}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-clockwise"/>
                        <span>Actualizar</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-success d-flex align-items-center gap-2"
                        onClick={handleExportCsv}
                        disabled={loading}
                    >
                        <i className="bi bi-filetype-csv"/>
                        <span>Exportar CSV</span>
                    </button>
                </div>
            </div>

            {/* Filtros de fecha */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-md-3">
                            <label htmlFor="startDate" className="form-label small fw-semibold">
                                Fecha inicio
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={activeTab === 'inventory'}
                            />
                        </div>

                        <div className="col-12 col-md-3">
                            <label htmlFor="endDate" className="form-label small fw-semibold">
                                Fecha fin
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={activeTab === 'inventory'}
                            />
                        </div>

                        <div className="col-12 col-md-6 d-flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => applyPresetRange('today')}
                                disabled={activeTab === 'inventory'}
                            >
                                Hoy
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => applyPresetRange('week')}
                                disabled={activeTab === 'inventory'}
                            >
                                Últimos 7 días
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => applyPresetRange('month')}
                                disabled={activeTab === 'inventory'}
                            >
                                Este mes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegación por pestañas */}
            <ul className="nav nav-pills gap-2 mb-4">
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link d-flex align-items-center gap-2 ${
                            activeTab === 'sales' ? 'active' : 'bg-body-tertiary border text-body'
                        }`}
                        onClick={() => setActiveTab('sales')}
                    >
                        <i className="bi bi-receipt"/>
                        <span>Ventas</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link d-flex align-items-center gap-2 ${
                            activeTab === 'inventory' ? 'active' : 'bg-body-tertiary border text-body'
                        }`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <i className="bi bi-box-seam"/>
                        <span>Inventario</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link d-flex align-items-center gap-2 ${
                            activeTab === 'top-products' ? 'active' : 'bg-body-tertiary border text-body'
                        }`}
                        onClick={() => setActiveTab('top-products')}
                    >
                        <i className="bi bi-trophy"/>
                        <span>Productos más vendidos</span>
                    </button>
                </li>
            </ul>

            {/* Tarjetas resumen */}
            {activeTab === 'sales' && (
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="text-muted small mb-1">Total de ventas</div>
                                <div className="h3 fw-bold mb-0">
                                    {salesReport?.summary.totalSalesCount ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="text-muted small mb-1">Ingresos totales</div>
                                <div className="h3 fw-bold text-primary mb-0">
                                    {formatCurrency(salesReport?.summary.totalRevenue ?? 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="row g-3 mb-4">
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="text-muted small mb-1">Productos activos</div>
                                <div className="h4 fw-bold mb-0">
                                    {inventoryReport?.summary.totalProducts ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="text-muted small mb-1">Stock bajo</div>
                                <div className="h4 fw-bold text-warning mb-0">
                                    {inventoryReport?.summary.lowStockCount ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="text-muted small mb-1">Valor a costo</div>
                                <div className="h4 fw-bold mb-0">
                                    {formatCurrency(inventoryReport?.summary.totalInventoryCostValue ?? 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="text-muted small mb-1">Valor a venta</div>
                                <div className="h4 fw-bold text-primary mb-0">
                                    {formatCurrency(inventoryReport?.summary.totalInventorySaleValue ?? 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'top-products' && (
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="text-muted small mb-1">Unidades vendidas</div>
                                <div className="h3 fw-bold mb-0">
                                    {topProducts.reduce(
                                        (acc, item) => acc + Number(item.totalQuantitySold || 0),
                                        0,
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="text-muted small mb-1">Ingresos por top productos</div>
                                <div className="h3 fw-bold text-primary mb-0">
                                    {formatCurrency(
                                        topProducts.reduce(
                                            (acc, item) => acc + Number(item.totalRevenue || 0),
                                            0,
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla principal */}
            <div className="card border-0 shadow-sm">
                <div
                    className="card-header bg-transparent py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <h2 className="h6 mb-0 fw-bold">
                        {activeTab === 'sales' && 'Detalle de ventas'}
                        {activeTab === 'inventory' && 'Estado de inventario'}
                        {activeTab === 'top-products' && 'Ranking de productos más vendidos'}
                    </h2>

                    {activeTab === 'inventory' && (
                        <div className="form-check form-switch mb-0">
                            <input
                                id="onlyLowStock"
                                className="form-check-input"
                                type="checkbox"
                                checked={onlyLowStock}
                                onChange={(e) => setOnlyLowStock(e.target.checked)}
                            />
                            <label htmlFor="onlyLowStock" className="form-check-label small">
                                Solo stock bajo o crítico
                            </label>
                        </div>
                    )}
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"/>
                            <p className="text-muted small mt-2 mb-0">Cargando información...</p>
                        </div>
                    ) : activeTab === 'sales' ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark">
                                <tr>
                                    <th># Venta</th>
                                    <th>Fecha</th>
                                    <th>Usuario</th>
                                    <th>Método de pago</th>
                                    <th className="text-center">Ítems</th>
                                    <th className="text-end">Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(salesReport?.data ?? []).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted">
                                            No se registraron ventas en el rango seleccionado.
                                        </td>
                                    </tr>
                                ) : (
                                    salesReport!.data.map((sale) => (
                                        <tr key={sale.id}>
                                            <td className="fw-semibold">#{sale.id}</td>
                                            <td>{formatDateTime(sale.createdAt)}</td>
                                            <td>{sale.user?.name || sale.user?.email || '—'}</td>
                                            <td>
                                                {PAYMENT_LABELS[sale.paymentMethod ?? ''] || sale.paymentMethod || '—'}
                                            </td>
                                            <td className="text-center">{sale.items?.length ?? 0}</td>
                                            <td className="text-end fw-bold text-primary">
                                                {formatCurrency(sale.total)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    ) : activeTab === 'inventory' ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark">
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th className="text-center">Stock</th>
                                    <th className="text-center">Mínimo</th>
                                    <th className="text-end">Costo</th>
                                    <th className="text-end">Precio venta</th>
                                    <th className="text-center">Estado</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredInventory.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-4 text-muted">
                                            No hay productos para mostrar con este filtro.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInventory.map((product) => {
                                        const isLow =
                                            Number(product.stock) <= Number(product.minStock);
                                        return (
                                            <tr key={product.id}>
                                                <td className="text-muted small">
                                                    {product.sku || product.code || product.id}
                                                </td>
                                                <td className="fw-semibold">{product.name}</td>
                                                <td className="text-center fw-bold">
                                                    {product.stock}
                                                </td>
                                                <td className="text-center text-muted">
                                                    {product.minStock}
                                                </td>
                                                <td className="text-end">
                                                    {formatCurrency(product.purchasePrice)}
                                                </td>
                                                <td className="text-end fw-semibold">
                                                    {formatCurrency(product.salePrice)}
                                                </td>
                                                <td className="text-center">
                                                    {isLow ? (
                                                        <span className="badge text-bg-warning">
                                                                Stock bajo
                                                            </span>
                                                    ) : (
                                                        <span className="badge text-bg-success">
                                                                Disponible
                                                            </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th className="text-center">Unidades vendidas</th>
                                    <th className="text-end">Ingresos generados</th>
                                </tr>
                                </thead>
                                <tbody>
                                {topProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-muted">
                                            No hay datos de productos vendidos en este período.
                                        </td>
                                    </tr>
                                ) : (
                                    topProducts.map((item, index) => (
                                        <tr key={`${item.productId}-${index}`}>
                                            <td className="fw-bold text-muted">{index + 1}</td>
                                            <td className="small text-muted">
                                                {item.productCode || item.productId}
                                            </td>
                                            <td className="fw-semibold">{item.productName}</td>
                                            <td className="text-center fw-bold">
                                                {item.totalQuantitySold}
                                            </td>
                                            <td className="text-end fw-bold text-primary">
                                                {formatCurrency(item.totalRevenue)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
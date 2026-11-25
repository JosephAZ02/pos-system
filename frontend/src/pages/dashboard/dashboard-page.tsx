import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import toast from 'react-hot-toast';
import {useAuth} from '../../context/auth.context';
import {getErrorMessage} from '../../services/auth/api';
import {
    type DashboardSummary,
    type DashboardTopProduct,
    getDashboardSummary,
    getDashboardTopProducts,
} from '../../services/dashboard.service';
import {formatColones} from '../../utils/formatters';

function MetricCard({
                        label,
                        value,
                        subtitle,
                        valueClassName,
                    }: {
    label: string;
    value: string | number;
    subtitle?: string;
    valueClassName?: string;
}) {
    return (
        <div className="col-sm-6 col-xl-3">
            <div className="card shadow-sm h-100">
                <div className="card-body">
                    <div className="text-muted small mb-1">{label}</div>
                    <div className={`h4 fw-bold mb-1 ${valueClassName ?? ''}`}>{value}</div>
                    {subtitle && <small className="text-muted">{subtitle}</small>}
                </div>
            </div>
        </div>
    );
}

export function DashboardPage() {
    const {user} = useAuth();
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [topProducts, setTopProducts] = useState<DashboardTopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadDashboard() {
        setLoading(true);
        try {
            const [summaryData, topData] = await Promise.all([
                getDashboardSummary(),
                getDashboardTopProducts(5),
            ]);
            setSummary(summaryData);
            setTopProducts(topData);
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cargar el dashboard.'));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    const todayRevenue = summary?.today.totalRevenue ?? 0;
    const todayOrders = summary?.today.totalOrders ?? 0;
    const monthRevenue = summary?.month.totalRevenue ?? 0;
    const monthOrders = summary?.month.totalOrders ?? 0;
    const totalProducts = summary?.products.totalProducts ?? 0;
    const lowStockProducts = summary?.products.lowStockProducts ?? 0;

    return (
        <div className="container-fluid">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <small className="text-primary">Resumen general</small>
                    <h1 className="h3 mb-0">
                        Dashboard{user?.name ? ` (${user.name})` : ''}
                    </h1>
                </div>

                <div className="d-flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={loadDashboard}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-clockwise me-2"/>
                        Actualizar
                    </button>
                    <Link to="/sales" className="btn btn-primary">
                        <i className="bi bi-cart3 me-2"/>
                        Nueva venta
                    </Link>
                    <Link to="/reports" className="btn btn-outline-secondary">
                        <i className="bi bi-graph-up me-2"/>
                        Ver reportes
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"/>
                    <br></br>
                    <div className="mt-2 text-muted">Cargando...</div>
                </div>
            ) : (
                <>
                    <div className="row g-3 mb-4">
                        <MetricCard
                            label="Recaudado hoy"
                            value={formatColones(todayRevenue)}
                            subtitle={`${todayOrders} ${todayOrders === 1 ? 'venta' : 'ventas'} hoy`}
                            valueClassName="text-primary"
                        />
                        <MetricCard
                            label="Recaudado este mes"
                            value={formatColones(monthRevenue)}
                            subtitle={`${monthOrders} ${monthOrders === 1 ? 'venta' : 'ventas'} en el mes`}
                            valueClassName="text-success"
                        />
                        <MetricCard
                            label="Productos activos"
                            value={totalProducts}
                            subtitle="Disponibles en catálogo"
                        />
                        <MetricCard
                            label="Stock bajo"
                            value={lowStockProducts}
                            subtitle={lowStockProducts > 0 ? 'Se necesitan reposiciones' : 'Inventario bien'}
                            valueClassName={lowStockProducts > 0 ? 'text-warning' : ''}
                        />
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                            <h2 className="h6 mb-0">Top 5 productos más vendidos</h2>
                            {lowStockProducts > 0 && (
                                <Link to="/products" className="btn btn-sm btn-outline-warning">
                                    <i className="bi bi-exclamation-triangle me-1"/>
                                    Revisar stock bajo ({lowStockProducts})
                                </Link>
                            )}
                        </div>

                        <div className="card-body p-2">
                            {topProducts.length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <i className="bi bi-trophy fs-3 d-block mb-2"/>
                                    <p className="mb-0">Aún no hay ventas registradas para mostrar.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>SKU</th>
                                            <th>Producto</th>
                                            <th className="text-center">Unidades vendidas</th>
                                            <th className="text-end">Subtotal (no IVA)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {topProducts.map((item, index) => (
                                            <tr key={item.productId}>
                                                <td className="fw-bold text-muted">{index + 1}</td>
                                                <td className="text-muted">{item.productCode}</td>
                                                <td className="fw-semibold">{item.productName}</td>
                                                <td className="text-center fw-bold">{item.totalQuantity}</td>
                                                <td className="text-end fw-semibold text-primary">
                                                    {formatColones(item.totalAmount)}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

import type {IProductDto} from '@pos/shared';
import {formatColones} from '../../utils/formatters';

export interface ProductTableProps {
    products: IProductDto[];
    onEdit: (product: IProductDto) => void;
    onDelete: (product: IProductDto) => void;
    canUpdate: boolean;
    canDelete: boolean;
}

function stockBadge(product: IProductDto) {
    if (product.stock === 0) {
        return <span className="badge text-bg-danger">Agotado</span>;
    }
    if (product.stock <= product.minStock) {
        return <span className="badge text-bg-warning">Stock bajo</span>;
    }
    return <span className="badge text-bg-success">Disponible</span>;
}

export function ProductTable({products, onEdit, onDelete, canUpdate, canDelete}: ProductTableProps) {
    const showActions = canUpdate || canDelete;

    if (products.length === 0) {
        return (
            <div className="text-center text-muted py-4">
                <i className="bi bi-box-seam fs-3 d-block mb-2"/>
                <p>No hay productos para mostrar con los filtros actuales.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="text-end">Precio compra</th>
                    <th className="text-end">Precio venta</th>
                    <th className="text-center">Stock</th>
                    <th className="text-center">Mínimo</th>
                    <th className="text-center">Inventario</th>
                    <th className="text-center">Estado</th>
                    {showActions && <th className="text-end">Acciones</th>}
                </tr>
                </thead>
                <tbody>
                {products.map((product) => {
                    const isLowStock = product.isActive && product.stock <= product.minStock;

                    return (
                        <tr key={product.id} className={!product.isActive ? 'table-secondary text-muted' : ''}>
                            <td className="text-muted">{product.sku}</td>

                            <td>
                                <div className="fw-semibold">{product.name}</div>
                                {product.description && (
                                    <small className="text-muted">{product.description}</small>
                                )}
                            </td>

                            <td>
                                <span className="badge bg-body-secondary">{product.category}</span>
                            </td>

                            <td className="text-end">{formatColones(product.purchasePrice)}</td>
                            <td className="text-end">{formatColones(product.salePrice)}</td>

                            <td className={`text-center fw-bold ${isLowStock ? 'text-danger' : ''}`}>
                                {product.stock}
                            </td>
                            <td className="text-center text-muted">{product.minStock}</td>
                            <td className="text-center">{stockBadge(product)}</td>

                            <td className="text-center">
                                {product.isActive
                                    ? <span className="badge text-bg-primary">Activo</span>
                                    : <span className="badge text-bg-secondary">Inactivo</span>
                                }
                            </td>

                            {showActions && (
                                <td className="text-end">
                                    <div className="btn-group btn-group-sm">
                                        {canUpdate && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                disabled={!product.isActive}
                                                title={product.isActive ? 'Editar producto' : 'Producto inactivo'}
                                                onClick={() => onEdit(product)}
                                            >
                                                <i className="bi bi-pencil"/>
                                            </button>
                                        )}

                                        {canDelete && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                disabled={!product.isActive}
                                                title={product.isActive ? 'Desactivar producto' : 'Ya está inactivo'}
                                                onClick={() => onDelete(product)}
                                            >
                                                <i className="bi bi-trash"/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

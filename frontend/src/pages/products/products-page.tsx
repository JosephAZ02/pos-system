import {useEffect, useState} from 'react';
import toast from 'react-hot-toast';
import type {ICreateProductDto, IProductDto} from '@pos/shared';
import {useAuth} from '../../context/auth.context';
import {getErrorMessage} from '../../services/auth/api';
import {createProduct, deleteProduct, getProducts, updateProduct} from '../../services/products.service';
import {showConfirm} from '../../components/utils/alerts';
import {ProductTable} from '../../components/products/ProductTable';
import {ProductFormModal} from '../../components/products/ProductFormModal';

const ALL_CATEGORIES = 'Todas';

function StatCard({label, value}: { label: string; value: number }) {
    return (
        <div className="col-sm-6 col-xl-3">
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="text-muted small">{label}</div>
                    <div className="h4 fw-bold mb-0">{value}</div>
                </div>
            </div>
        </div>
    );
}

export function ProductsPage() {
    const {user} = useAuth();
    const permissions = user?.permissions || [];

    const canCreate = permissions.includes('products.create');
    const canUpdate = permissions.includes('products.update');
    const canDelete = permissions.includes('products.delete');

    const [products, setProducts] = useState<IProductDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
    const [onlyLowStock, setOnlyLowStock] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProductDto | null>(null);
    const [saving, setSaving] = useState(false);

    async function loadProducts() {
        setLoading(true);
        try {
            const data = await getProducts(!showInactive);
            setProducts(data);
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar los productos.'));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, [showInactive]);

    const categories: string[] = [];
    for (const product of products) {
        if (!categories.includes(product.category)) {
            categories.push(product.category);
        }
    }
    categories.sort();

    const activeProducts = products.filter((p) => p.isActive);
    const lowStockCount = activeProducts.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStockCount = activeProducts.filter((p) => p.stock === 0).length;

    const searchText = search.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
        if (selectedCategory !== ALL_CATEGORIES && product.category !== selectedCategory) {
            return false;
        }

        if (onlyLowStock && product.stock > product.minStock) {
            return false;
        }

        if (searchText !== '') {
            const matchesText =
                product.name.toLowerCase().includes(searchText) ||
                product.sku.toLowerCase().includes(searchText) ||
                (product.description || '').toLowerCase().includes(searchText);

            if (!matchesText) return false;
        }

        return true;
    });

    function handleOpenCreate() {
        setEditingProduct(null);
        setModalOpen(true);
    }

    function handleOpenEdit(product: IProductDto) {
        setEditingProduct(product);
        setModalOpen(true);
    }

    function handleCloseModal() {
        setModalOpen(false);
        setEditingProduct(null);
    }

    async function handleSave(payload: ICreateProductDto) {
        setSaving(true);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
                toast.success('Producto actualizado');
            } else {
                await createProduct(payload);
                toast.success('Producto creado');
            }

            handleCloseModal();
            await loadProducts();
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el producto.'));
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(product: IProductDto) {
        const confirmed = await showConfirm(
            '¿Desactivar producto?',
            `El producto <strong>${product.name}</strong> (${product.sku}) dejará de estar disponible para ventas.`,
            'Sí, desactivar',
        );

        if (!confirmed) return;

        try {
            await deleteProduct(product.id);
            toast.success(`Producto "${product.name}" desactivado.`);
            await loadProducts();
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo desactivar el producto.'));
        }
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <small className="text-primary">Gestión de inventario</small>
                    <h1 className="h3 mb-0">Productos</h1>
                </div>

                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-secondary" onClick={loadProducts} disabled={loading}>
                        <i className="bi bi-arrow-clockwise me-2"/>
                        Actualizar
                    </button>

                    {canCreate && (
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            <i className="bi bi-plus-lg me-2"/>
                            Nuevo producto
                        </button>
                    )}
                </div>
            </div>

            <div className="row g-3 mb-4">
                <StatCard label="Productos activos" value={activeProducts.length}/>
                <StatCard label="Stock bajo" value={lowStockCount}/>
                <StatCard label="Agotados" value={outOfStockCount}/>
                <StatCard label="Categorías" value={categories.length}/>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-body-tertiary">
                                    <i className="bi bi-search"/>
                                </span>
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Buscar por nombre, SKU o descripción..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value={ALL_CATEGORIES}>Todas las categorías</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4 d-flex gap-3">
                            <div className="form-check form-switch">
                                <input
                                    id="filterLowStock"
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={onlyLowStock}
                                    onChange={(e) => setOnlyLowStock(e.target.checked)}
                                />
                                <label htmlFor="filterLowStock" className="form-check-label">
                                    Solo stock bajo
                                </label>
                            </div>

                            <div className="form-check form-switch">
                                <input
                                    id="filterInactive"
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={showInactive}
                                    onChange={(e) => setShowInactive(e.target.checked)}
                                />
                                <label htmlFor="filterInactive" className="form-check-label">
                                    Mostrar inactivos
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-transparent">
                    <h2 className="h6 mb-0">Lista de productos</h2>
                </div>

                <div className="card-body p-2">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"/>
                            <div className="mt-2">Cargando...</div>
                        </div>
                    ) : (
                        <ProductTable
                            products={filteredProducts}
                            onEdit={handleOpenEdit}
                            onDelete={handleDelete}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                        />
                    )}
                </div>
            </div>

            <ProductFormModal
                show={modalOpen}
                productToEdit={editingProduct}
                categories={categories}
                saving={saving}
                onClose={handleCloseModal}
                onSubmit={handleSave}
            />
        </div>
    );
}

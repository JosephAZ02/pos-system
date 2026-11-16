import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { CreateSaleRequest, IProductDto, PaymentMethod } from '@pos/shared';
import { ProductCard } from '../../components/pos/ProductCard';
import { CartPanel } from '../../components/pos/CartPanel';
import { useCart } from '../../context/CartContext';
import { getErrorMessage } from '../../services/auth/api';
import { getProducts } from '../../services/products.service';
import { createSale } from '../../services/sales.service';

import './PosRegisterPage.css';

const ALL_CATEGORIES = 'Todos';

export const PosRegisterPage = () => {
    const { items, addItem, clearCart } = useCart();

    const [products, setProducts] = useState<IProductDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(ALL_CATEGORIES);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [amountPaid, setAmountPaid] = useState('');
    const [saving, setSaving] = useState(false);

    const loadProducts = () => {
        return getProducts()
            .then((data) => setProducts(data))
            .catch((error) => toast.error(getErrorMessage(error, 'No se pudieron cargar los productos')))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const categories = [ALL_CATEGORIES, ...new Set(products.map((product) => product.category))];

    const searchText = search.trim().toLowerCase();
    const visibleProducts = products.filter((product) => {
        const matchesCategory = category === ALL_CATEGORIES || product.category === category;
        const matchesSearch =
            product.name.toLowerCase().includes(searchText) || product.sku.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });

    const getQuantityInCart = (productId: number) => {
        const item = items.find((cartItem) => cartItem.product.id === productId);
        return item ? item.quantity : 0;
    };

    const handleAdd = (product: IProductDto) => {
        const added = addItem(product);
        if (!added) {
            toast.error(`No hay más stock de ${product.name}`);
        }
    };

    const handleComplete = async () => {
        const request: CreateSaleRequest = {
            items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
            paymentMethod,
        };
        if (paymentMethod === 'CASH') {
            request.amountPaid = Number(amountPaid);
        }

        setSaving(true);
        try {
            const sale = await createSale(request);
            toast.success(`Venta #${sale.id} registrada`);
            clearCart();
            setAmountPaid('');
            await loadProducts();
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo completar la venta'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="row g-4">
            <div className="col-lg-8">
                <small className="text-pos fw-semibold text-uppercase">Punto de venta</small>
                <h2 className="mb-3">Nueva venta</h2>

                <div className="input-group mb-3">
                    <span className="input-group-text bg-white">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Buscar por nombre o código..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="d-flex flex-wrap gap-2 mb-4">
                    {categories.map((name) => (
                        <button
                            key={name}
                            type="button"
                            className={`btn btn-sm rounded-pill ${category === name ? 'btn-pos' : 'btn-outline-secondary'}`}
                            onClick={() => setCategory(name)}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {loading && <p className="text-muted">Cargando productos...</p>}

                {!loading && visibleProducts.length === 0 && (
                    <p className="text-muted">No hay productos que coincidan.</p>
                )}

                <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
                    {visibleProducts.map((product) => (
                        <div className="col" key={product.id}>
                            <ProductCard
                                product={product}
                                quantityInCart={getQuantityInCart(product.id)}
                                onAdd={handleAdd}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-lg-4">
                <div className="sticky-lg-top" style={{ top: '1rem' }}>
                    <CartPanel
                        paymentMethod={paymentMethod}
                        amountPaid={amountPaid}
                        saving={saving}
                        onPaymentMethodChange={setPaymentMethod}
                        onAmountPaidChange={setAmountPaid}
                        onComplete={handleComplete}
                    />
                </div>
            </div>
        </div>
    );
};

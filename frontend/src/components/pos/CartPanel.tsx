import type {PaymentMethod} from '@pos/shared';
import {useCart} from '../../context/CartContext';
import {formatColones} from '../../utils/formatters';

interface CartPanelProps {
    paymentMethod: PaymentMethod;
    amountPaid: string;
    saving: boolean;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    onAmountPaidChange: (amount: string) => void;
    onComplete: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    {value: 'CASH', label: 'Efectivo'},
    {value: 'CARD', label: 'Tarjeta'},
    {value: 'TRANSFER', label: 'SINPE'},
];

export const CartPanel = ({
                              paymentMethod,
                              amountPaid,
                              saving,
                              onPaymentMethodChange,
                              onAmountPaidChange,
                              onComplete,
                          }: CartPanelProps) => {
    const {items, itemCount, subtotal, tax, total, changeQuantity, removeItem, clearCart} = useCart();

    const isCash = paymentMethod === 'CASH';
    const received = Number(amountPaid) || 0;
    const change = Math.max(received - total, 0);
    const notEnoughCash = isCash && received < total;
    const cannotComplete = items.length === 0 || notEnoughCash || saving;

    return (
        <div className="card">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 className="mb-0">Detalle de venta</h5>
                        <small className="text-muted">
                            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                        </small>
                    </div>
                    <button
                        type="button"
                        className="btn btn-link text-pos text-decoration-none p-0"
                        disabled={items.length === 0}
                        onClick={clearCart}
                    >
                        Limpiar
                    </button>
                </div>

                {items.length === 0 && (
                    <p className="text-muted text-center my-4">Agrega productos para iniciar la venta.</p>
                )}

                <ul className="list-group list-group-flush my-3">
                    {items.map((item) => (
                        <li key={item.product.id} className="list-group-item px-0">
                            <div className="d-flex justify-content-between">
                                <span className="fw-semibold">{item.product.name}</span>
                                <button
                                    type="button"
                                    className="btn btn-sm text-danger p-0"
                                    onClick={() => removeItem(item.product.id)}
                                    aria-label={`Quitar ${item.product.name}`}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <div className="btn-group btn-group-sm">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => changeQuantity(item.product.id, item.quantity - 1)}
                                    >
                                        <i className="bi bi-dash"></i>
                                    </button>
                                    <span className="btn btn-outline-secondary disabled text-body">
                                        {item.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={item.quantity >= item.product.stock}
                                        onClick={() => changeQuantity(item.product.id, item.quantity + 1)}
                                    >
                                        <i className="bi bi-plus"></i>
                                    </button>
                                </div>
                                <span>{formatColones(item.product.salePrice * item.quantity)}</span>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="d-flex justify-content-between text-muted">
                    <span>Subtotal</span>
                    <span>{formatColones(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between text-muted">
                    <span>IVA 13%</span>
                    <span>{formatColones(tax)}</span>
                </div>
                <hr className="my-2"/>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Total</span>
                    <span className="fs-4 fw-bold">{formatColones(total)}</span>
                </div>

                <label className="form-label fw-semibold small">Método de pago</label>
                <div className="d-flex gap-2 mb-3">
                    {PAYMENT_METHODS.map((method) => (
                        <button
                            key={method.value}
                            type="button"
                            className={`btn btn-sm flex-fill ${paymentMethod === method.value ? 'btn-pos' : 'btn-outline-secondary'}`}
                            onClick={() => onPaymentMethodChange(method.value)}
                        >
                            {method.label}
                        </button>
                    ))}
                </div>

                {isCash && (
                    <div className="row g-2 mb-3">
                        <div className="col-7">
                            <label htmlFor="amountPaid" className="form-label fw-semibold small">
                                Monto recibido
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">₡</span>
                                <input
                                    id="amountPaid"
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    placeholder="0"
                                    value={amountPaid}
                                    onChange={(event) => onAmountPaidChange(event.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-5">
                            <label className="form-label fw-semibold small">Vuelto</label>
                            <div className="form-control bg-body-secondary fw-bold">{formatColones(change)}</div>
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    className="btn btn-pos btn-lg w-100 d-flex justify-content-between"
                    disabled={cannotComplete}
                    onClick={onComplete}
                >
                    <span>{saving ? 'Guardando...' : 'Completar venta'}</span>
                    <span>{formatColones(total)}</span>
                </button>
            </div>
        </div>
    );
};

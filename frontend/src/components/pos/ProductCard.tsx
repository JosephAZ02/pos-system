import type { IProductDto } from '@pos/shared';
import { formatColones } from '../../utils/formatters';

interface ProductCardProps {
    product: IProductDto;
    quantityInCart: number;
    onAdd: (product: IProductDto) => void;
}

export const ProductCard = ({ product, quantityInCart, onAdd }: ProductCardProps) => {
    const noStockLeft = quantityInCart >= product.stock;

    return (
        <div className="card h-100">
            <div className="position-relative bg-light text-center text-secondary py-5 rounded-top">
                <i className="bi bi-image fs-1"></i>
                <span
                    className={`badge position-absolute top-0 end-0 m-2 ${product.stock === 0 ? 'bg-danger' : 'bg-secondary'}`}
                >
                    {product.stock} unid.
                </span>
            </div>

            <div className="card-body d-flex flex-column">
                <small className="text-pos fw-semibold text-uppercase">{product.category}</small>
                <h6 className="card-title mt-1 mb-1">{product.name}</h6>
                <small className="text-muted">{product.sku}</small>

                <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                    <span className="fw-bold">{formatColones(product.salePrice)}</span>
                    <button
                        type="button"
                        className="btn btn-outline-pos btn-sm"
                        disabled={noStockLeft}
                        onClick={() => onAdd(product)}
                        aria-label={`Agregar ${product.name}`}
                    >
                        <i className="bi bi-plus-lg"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

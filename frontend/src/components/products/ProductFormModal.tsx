import {type SubmitEvent, useEffect, useState} from 'react';
import type {ICreateProductDto, IProductDto} from '@pos/shared';

export interface ProductFormModalProps {
    show: boolean;
    productToEdit: IProductDto | null;
    categories: string[];
    saving: boolean;
    onClose: () => void;
    onSubmit: (data: ICreateProductDto) => Promise<void>;
}

export function ProductFormModal({show, productToEdit, categories, saving, onClose, onSubmit}: ProductFormModalProps) {
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [stock, setStock] = useState('');
    const [minStock, setMinStock] = useState('');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (!show) return;

        setValidationError('');
        if (productToEdit) {
            setSku(productToEdit.sku);
            setName(productToEdit.name);
            setDescription(productToEdit.description ?? '');
            setImageUrl(productToEdit.imageUrl ?? '');
            setCategory(productToEdit.category);
            setPurchasePrice(String(productToEdit.purchasePrice));
            setSalePrice(String(productToEdit.salePrice));
            setStock(String(productToEdit.stock));
            setMinStock(String(productToEdit.minStock));
        } else {
            setSku('');
            setName('');
            setDescription('');
            setImageUrl('');
            setCategory('');
            setPurchasePrice('');
            setSalePrice('');
            setStock('0');
            setMinStock('5');
        }
    }, [productToEdit, show]);

    if (!show) {
        return null;
    }

    const isEditing = productToEdit !== null;

    async function handleFormSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setValidationError('');

        const trimmedSku = sku.trim();
        const trimmedName = name.trim();
        const trimmedCategory = category.trim();
        const trimmedDescription = description.trim();
        const trimmedImageUrl = imageUrl.trim();

        const parsedPurchase = Number(purchasePrice);
        const parsedSale = Number(salePrice);
        const parsedStock = Number(stock);
        const parsedMinStock = Number(minStock);

        if (!trimmedSku || !trimmedName || !trimmedCategory) {
            setValidationError('SKU, nombre y categoría son obligatorios.');
            return;
        }

        if (Number.isNaN(parsedPurchase) || parsedPurchase < 0) {
            setValidationError('El precio de compra debe ser un número mayor o igual a 0.');
            return;
        }

        if (Number.isNaN(parsedSale) || parsedSale < 0) {
            setValidationError('El precio de venta debe ser un número mayor o igual a 0.');
            return;
        }

        if (!Number.isInteger(parsedStock) || parsedStock < 0) {
            setValidationError('El stock actual debe ser un número entero mayor o igual a 0.');
            return;
        }

        if (!Number.isInteger(parsedMinStock) || parsedMinStock < 0) {
            setValidationError('El stock mínimo debe ser un número entero mayor o igual a 0.');
            return;
        }

        const payload: ICreateProductDto = {
            sku: trimmedSku,
            name: trimmedName,
            category: trimmedCategory,
            purchasePrice: parsedPurchase,
            salePrice: parsedSale,
            stock: parsedStock,
            minStock: parsedMinStock,
            imageUrl: trimmedImageUrl === '' ? null : trimmedImageUrl,
        };

        if (trimmedDescription !== '') {
            payload.description = trimmedDescription;
        }

        await onSubmit(payload);
    }

    return (
        <>
            <div className="modal-backdrop show" onClick={!saving ? onClose : undefined}/>
            <div className="modal show d-block">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleFormSubmit}>
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {isEditing ? 'Editar producto' : 'Nuevo producto'}
                                </h5>
                                <button type="button" className="btn-close" disabled={saving} onClick={onClose}/>
                            </div>

                            <div className="modal-body">
                                {validationError && (
                                    <div className="alert alert-danger">{validationError}</div>
                                )}

                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label htmlFor="productSku" className="form-label">SKU</label>
                                        <input
                                            id="productSku"
                                            type="text"
                                            className="form-control"
                                            maxLength={50}
                                            placeholder="AAA-000"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-8">
                                        <label htmlFor="productName" className="form-label">Nombre del producto</label>
                                        <input
                                            id="productName"
                                            type="text"
                                            className="form-control"
                                            maxLength={150}
                                            placeholder="CocaCola 3L"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="productCategory" className="form-label">Categoría</label>
                                        <input
                                            id="productCategory"
                                            type="text"
                                            className="form-control"
                                            list="product-categories-list"
                                            maxLength={100}
                                            placeholder="Bebidas"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            required
                                        />
                                        <datalist id="product-categories-list">
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}/>
                                            ))}
                                        </datalist>
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="productDescription" className="form-label">Descripción</label>
                                        <input
                                            id="productDescription"
                                            type="text"
                                            className="form-control"
                                            placeholder="Opcional"
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="productImageUrl" className="form-label">URL de la imagen</label>
                                        <input
                                            id="productImageUrl"
                                            type="url"
                                            className="form-control"
                                            maxLength={500}
                                            placeholder="https://... (opcional)"
                                            value={imageUrl}
                                            onChange={(event) => setImageUrl(event.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="productPurchasePrice" className="form-label">Precio
                                            compra</label>
                                        <input
                                            id="productPurchasePrice"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="form-control"
                                            value={purchasePrice}
                                            onChange={(event) => setPurchasePrice(event.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="productSalePrice" className="form-label">Precio venta</label>
                                        <input
                                            id="productSalePrice"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="form-control"
                                            value={salePrice}
                                            onChange={(event) => setSalePrice(event.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="productStock" className="form-label">Stock actual</label>
                                        <input
                                            id="productStock"
                                            type="number"
                                            min="0"
                                            step="1"
                                            className="form-control"
                                            value={stock}
                                            onChange={(event) => setStock(event.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="productMinStock" className="form-label">Stock mínimo</label>
                                        <input
                                            id="productMinStock"
                                            type="number"
                                            min="0"
                                            step="1"
                                            className="form-control"
                                            value={minStock}
                                            onChange={(event) => setMinStock(event.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" disabled={saving}
                                        onClick={onClose}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

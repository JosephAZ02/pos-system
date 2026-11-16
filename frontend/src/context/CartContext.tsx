import { createContext, useContext, useState, type ReactNode } from 'react';
import type { IProductDto } from '@pos/shared';

const TAX_RATE = 0.13;

export interface CartItem {
    product: IProductDto;
    quantity: number;
}

interface CartContextData {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    tax: number;
    total: number;
    addItem: (product: IProductDto) => boolean;
    removeItem: (productId: number) => void;
    changeQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = (product: IProductDto): boolean => {
        const existing = items.find((item) => item.product.id === product.id);
        const currentQuantity = existing ? existing.quantity : 0;

        if (currentQuantity >= product.stock) {
            return false;
        }

        if (existing) {
            changeQuantity(product.id, currentQuantity + 1);
        } else {
            setItems([...items, { product, quantity: 1 }]);
        }
        return true;
    };

    const removeItem = (productId: number) => {
        setItems(items.filter((item) => item.product.id !== productId));
    };

    const changeQuantity = (productId: number, quantity: number) => {
        if (quantity < 1) {
            removeItem(productId);
            return;
        }

        setItems(
            items.map((item) => {
                if (item.product.id !== productId) {
                    return item;
                }
                return { ...item, quantity: Math.min(quantity, item.product.stock) };
            }),
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = subtotal + tax;

    return (
        <CartContext.Provider
            value={{ items, itemCount, subtotal, tax, total, addItem, removeItem, changeQuantity, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

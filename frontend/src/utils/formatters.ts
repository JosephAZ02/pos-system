import type {PaymentMethod} from '@pos/shared';

const colonesFormatter = new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const colonesWithCentsFormatter = new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'short',
    timeStyle: 'short',
});

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'SINPE / Transferencia',
};

export function formatColones(amount: number): string {
    return colonesFormatter.format(amount);
}

export function formatColonesWithCents(amount: number): string {
    return colonesWithCentsFormatter.format(amount);
}

export function formatDateTime(date: Date | string): string {
    return dateTimeFormatter.format(new Date(date));
}

export function formatPaymentMethod(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method];
}

const colonesFormatter = new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export function formatColones(amount: number): string {
    return colonesFormatter.format(amount);
}

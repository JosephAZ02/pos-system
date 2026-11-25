import type {SaleDto} from '@pos/shared';
import {formatDateTime, formatPaymentMethod} from './formatters';

export const STORE_NAME = 'POS System';

const PAGE_WIDTH = 80;
const MARGIN = 5;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 4.5;
const FONT_SIZE = 8;

const amountFormatter = new Intl.NumberFormat('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

type TicketRow =
    | { kind: 'text'; text: string; align: 'left' | 'center'; bold?: boolean }
    | { kind: 'pair'; left: string; right: string; bold?: boolean }
    | { kind: 'separator' };

const pdfText = (text: string) => text.replace(/[  ]/g, ' ');

const pdfAmount = (amount: number) => pdfText(`CRC ${amountFormatter.format(amount)}`);

function buildRows(sale: SaleDto, splitText: (text: string) => string[]): TicketRow[] {
    const rows: TicketRow[] = [
        {kind: 'text', text: STORE_NAME, align: 'center', bold: true},
        {kind: 'text', text: 'Comprobante de venta', align: 'center'},
        {kind: 'separator'},
        {kind: 'pair', left: 'Ticket', right: `#${String(sale.id).padStart(6, '0')}`},
        {kind: 'pair', left: 'Fecha', right: pdfText(formatDateTime(sale.createdAt))},
        {kind: 'pair', left: 'Cajero', right: sale.cashierName},
        {kind: 'pair', left: 'Pago', right: formatPaymentMethod(sale.paymentMethod)},
        {kind: 'separator'},
    ];

    for (const item of sale.items) {
        for (const line of splitText(item.productName)) {
            rows.push({kind: 'text', text: line, align: 'left', bold: true});
        }
        rows.push({
            kind: 'pair',
            left: `  ${item.quantity} x ${pdfAmount(item.unitPrice)}`,
            right: pdfAmount(item.lineTotal),
        });
    }

    rows.push(
        {kind: 'separator'},
        {kind: 'pair', left: 'Subtotal', right: pdfAmount(sale.subtotal)},
        {kind: 'pair', left: 'IVA 13%', right: pdfAmount(sale.tax)},
        {kind: 'pair', left: 'TOTAL', right: pdfAmount(sale.total), bold: true},
    );

    if (sale.amountPaid !== null) {
        rows.push(
            {kind: 'pair', left: 'Pagado', right: pdfAmount(sale.amountPaid)},
            {kind: 'pair', left: 'Cambio', right: pdfAmount(sale.changeAmount ?? 0)},
        );
    }

    rows.push(
        {kind: 'separator'},
        {kind: 'text', text: '¡Gracias por su compra!', align: 'center'},
    );

    return rows;
}

export async function downloadTicketPdf(sale: SaleDto): Promise<void> {
    const {jsPDF} = await import('jspdf');
    const measureDoc = new jsPDF({unit: 'mm', format: [PAGE_WIDTH, PAGE_WIDTH]});
    measureDoc.setFontSize(FONT_SIZE);
    measureDoc.setFont('helvetica', 'bold');
    const splitText = (text: string) => measureDoc.splitTextToSize(pdfText(text), CONTENT_WIDTH) as string[];

    const rows = buildRows(sale, splitText);
    const pageHeight = MARGIN * 2 + rows.length * LINE_HEIGHT;

    const doc = new jsPDF({unit: 'mm', format: [PAGE_WIDTH, pageHeight]});
    doc.setFontSize(FONT_SIZE);
    doc.setLineDashPattern([1, 1], 0);

    let y = MARGIN + LINE_HEIGHT - 1;

    for (const row of rows) {
        if (row.kind === 'separator') {
            doc.line(MARGIN, y - 1.5, PAGE_WIDTH - MARGIN, y - 1.5);
        } else {
            doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
            if (row.kind === 'text') {
                const x = row.align === 'center' ? PAGE_WIDTH / 2 : MARGIN;
                doc.text(row.text, x, y, {align: row.align});
            } else {
                doc.text(row.left, MARGIN, y);
                doc.text(row.right, PAGE_WIDTH - MARGIN, y, {align: 'right'});
            }
        }
        y += LINE_HEIGHT;
    }

    doc.save(`ticket-venta-${sale.id}.pdf`);
}

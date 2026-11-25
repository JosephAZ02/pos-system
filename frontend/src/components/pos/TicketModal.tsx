import {useState} from 'react';
import toast from 'react-hot-toast';
import type {SaleDto} from '@pos/shared';
import {formatColonesWithCents, formatDateTime, formatPaymentMethod} from '../../utils/formatters';
import {downloadTicketPdf, STORE_NAME} from '../../utils/ticketPdf';

interface TicketModalProps {
    sale: SaleDto;
    onClose: () => void;
}

export const TicketModal = ({sale, onClose}: TicketModalProps) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadTicketPdf(sale);
        } catch {
            toast.error('No se pudo generar el PDF del ticket');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <div className="modal-backdrop show" onClick={onClose}/>
            <div className="modal show d-block" role="dialog" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                Venta #{sale.id} registrada
                            </h5>
                            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}/>
                        </div>

                        <div className="modal-body">
                            <div className="border rounded p-3 mx-auto font-monospace small" style={{maxWidth: '340px'}}>
                                <div className="text-center fw-bold">{STORE_NAME}</div>
                                <div className="text-center text-muted">Comprobante de venta</div>
                                <hr className="my-2"/>

                                <div className="d-flex justify-content-between">
                                    <span>Ticket</span>
                                    <span>#{String(sale.id).padStart(6, '0')}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Fecha</span>
                                    <span>{formatDateTime(sale.createdAt)}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Cajero</span>
                                    <span>{sale.cashierName}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Pago</span>
                                    <span>{formatPaymentMethod(sale.paymentMethod)}</span>
                                </div>
                                <hr className="my-2"/>

                                {sale.items.map((item) => (
                                    <div key={item.id} className="mb-1">
                                        <div className="fw-semibold">{item.productName}</div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">
                                                {item.quantity} x {formatColonesWithCents(item.unitPrice)}
                                            </span>
                                            <span>{formatColonesWithCents(item.lineTotal)}</span>
                                        </div>
                                    </div>
                                ))}
                                <hr className="my-2"/>

                                <div className="d-flex justify-content-between">
                                    <span>Subtotal</span>
                                    <span>{formatColonesWithCents(sale.subtotal)}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>IVA 13%</span>
                                    <span>{formatColonesWithCents(sale.tax)}</span>
                                </div>
                                <div className="d-flex justify-content-between fw-bold fs-6">
                                    <span>TOTAL</span>
                                    <span>{formatColonesWithCents(sale.total)}</span>
                                </div>

                                {sale.amountPaid !== null && (
                                    <>
                                        <div className="d-flex justify-content-between">
                                            <span>Pagado</span>
                                            <span>{formatColonesWithCents(sale.amountPaid)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span>Cambio</span>
                                            <span>{formatColonesWithCents(sale.changeAmount ?? 0)}</span>
                                        </div>
                                    </>
                                )}
                                <hr className="my-2"/>

                                <div className="text-center">¡Gracias por su compra!</div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-pos" disabled={downloading} onClick={handleDownload}>
                                <i className="bi bi-file-earmark-pdf me-2"></i>
                                {downloading ? 'Generando...' : 'Descargar PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

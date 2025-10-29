
import React, { useMemo } from 'react';
import { Patient, Invoice, TimelineEvent, TimelineEventItemType, Note, TimelinePayment, InvoiceStatus } from '../types';
import { DocumentTextIcon, AttachmentIcon, SparklesIcon, CurrencyDollarIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from './Icons';

type PatientHistoryProps = {
    patient: Patient;
    invoices: Invoice[];
};

const InvoiceStatusBadge: React.FC<{status: InvoiceStatus}> = ({status}) => {
    const styles = {
        [InvoiceStatus.Paid]: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircleIcon className="w-4 h-4" /> },
        [InvoiceStatus.Pending]: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <ClockIcon className="w-4 h-4" /> },
        [InvoiceStatus.Overdue]: { bg: 'bg-red-100', text: 'text-red-800', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
    };
    const style = styles[status];
    return <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>{style.icon} {status}</span>;
}


const NoteCard: React.FC<{ note: Note }> = ({ note }) => (
    <div>
        <h4 className="font-semibold text-brand-secondary">Nota de Sesión</h4>
        <p className="mt-2 text-brand-text whitespace-pre-wrap">{note.content}</p>
        {note.attachments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
            <h5 className="text-sm font-semibold text-brand-muted mb-2">Archivos Adjuntos:</h5>
            <div className="flex flex-wrap gap-2">
                {note.attachments.map(file => (
                    <a key={file.id} href={file.dataUrl} download={file.fileName} className="flex items-center gap-2 bg-white border border-gray-300 text-sm px-3 py-1 rounded-full text-brand-primary hover:bg-brand-light transition">
                        <AttachmentIcon className="w-4 h-4" />
                        <span>{file.fileName}</span>
                    </a>
                ))}
            </div>
            </div>
        )}
    </div>
);

const InvoiceCard: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
    const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return (
        <div>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-brand-secondary">Factura Creada: {invoice.invoiceNumber}</h4>
                    <p className="text-sm text-brand-muted">Vence: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="mt-2 text-xl font-bold text-brand-text">{total.toFixed(2)}$</p>
        </div>
    );
};

const PaymentCard: React.FC<{ payment: TimelinePayment }> = ({ payment }) => (
    <div>
        <h4 className="font-semibold text-brand-secondary">Pago Recibido</h4>
        <p className="mt-2 text-xl font-bold text-green-600">{payment.amount.toFixed(2)}$</p>
        <p className="text-sm text-brand-muted">Método: {payment.method} | Factura: {payment.invoiceNumber}</p>
    </div>
);

const EventIcon: React.FC<{ type: TimelineEventItemType }> = ({ type }) => {
    const iconMap = {
        [TimelineEventItemType.Note]: { icon: <DocumentTextIcon className="h-5 w-5" />, color: 'bg-blue-500' },
        [TimelineEventItemType.Invoice]: { icon: <SparklesIcon className="h-5 w-5" />, color: 'bg-purple-500' },
        [TimelineEventItemType.Payment]: { icon: <CurrencyDollarIcon className="h-5 w-5" />, color: 'bg-green-500' },
    };
    const { icon, color } = iconMap[type];

    return (
        <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-white ${color}`}>
            {icon}
        </div>
    );
};

export const PatientHistory: React.FC<PatientHistoryProps> = ({ patient, invoices }) => {
    const sortedEvents = useMemo(() => {
        const timelineEvents: TimelineEvent[] = [];

        patient.notes.forEach(note => {
            timelineEvents.push({
                type: TimelineEventItemType.Note,
                date: note.date,
                data: note,
            });
        });

        invoices.forEach(invoice => {
            timelineEvents.push({
                type: TimelineEventItemType.Invoice,
                date: invoice.issueDate,
                data: invoice,
            });
            invoice.payments.forEach(payment => {
                timelineEvents.push({
                    type: TimelineEventItemType.Payment,
                    date: payment.date,
                    data: {
                        ...payment,
                        invoiceNumber: invoice.invoiceNumber,
                        invoiceId: invoice.id,
                    },
                });
            });
        });

        return timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [patient.notes, invoices]);

    if (sortedEvents.length === 0) {
        return <div className="text-center p-8 text-brand-muted">No hay historial para este paciente.</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-brand-text mb-6">Historial Cronológico</h2>
            <div className="flow-root">
                {sortedEvents.map((event, index) => (
                    <div key={`${event.type}-${(event.data as any).id}`} className="relative flex items-start">
                        {index < sortedEvents.length -1 && <div className="absolute left-4 top-5 h-full w-0.5 bg-gray-200"></div>}
                        <EventIcon type={event.type} />
                        <div className="ml-4 flex-1 pb-8">
                            <p className="text-sm font-semibold text-brand-muted mb-2">
                                {new Date(event.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                {event.type === TimelineEventItemType.Note && <NoteCard note={event.data as Note} />}
                                {event.type === TimelineEventItemType.Invoice && <InvoiceCard invoice={event.data as Invoice} />}
                                {event.type === TimelineEventItemType.Payment && <PaymentCard payment={event.data as TimelinePayment} />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
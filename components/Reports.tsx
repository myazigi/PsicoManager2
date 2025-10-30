
import React, { useMemo } from 'react';
import { Invoice, Patient, Payment, InvoiceStatus } from '../types';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from './Icons';

type ReportsProps = {
    invoices: Invoice[];
    patients: Patient[];
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


export const Reports: React.FC<ReportsProps> = ({ invoices, patients }) => {
    const patientMap = useMemo(() => new Map(patients.map(p => [p.id, p.name])), [patients]);

    const financialSummary = useMemo(() => {
        let totalBilled = 0;
        let totalPaid = 0;
        invoices.forEach(inv => {
            const invoiceTotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
            totalBilled += invoiceTotal;
            totalPaid += inv.payments.reduce((sum, p) => sum + p.amount, 0);
        });
        return { totalBilled, totalPaid, totalPending: totalBilled - totalPaid };
    }, [invoices]);

    const recentPayments = useMemo(() => {
        const allPayments: (Payment & { patientName: string; invoiceNumber: string })[] = [];
        invoices.forEach(invoice => {
            invoice.payments.forEach(payment => {
                allPayments.push({
                    ...payment,
                    patientName: patientMap.get(invoice.patientId) || 'Desconocido',
                    invoiceNumber: invoice.invoiceNumber
                });
            });
        });
        return allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    }, [invoices, patientMap]);

    const pendingInvoices = useMemo(() => {
        return invoices
            .filter(inv => inv.status === InvoiceStatus.Pending || inv.status === InvoiceStatus.Overdue)
            .map(inv => {
                const total = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
                return { ...inv, total };
            })
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [invoices]);

    return (
        <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-brand-text mb-6">Informes Financieros</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm"><div className="text-sm text-gray-600">Ingresos Totales (Cobrado)</div><div className="text-3xl font-bold text-green-600 mt-2">{financialSummary.totalPaid.toFixed(2)}$</div></div>
                <div className="bg-white p-6 rounded-xl shadow-sm"><div className="text-sm text-gray-600">Total Pendiente de Cobro</div><div className="text-3xl font-bold text-red-600 mt-2">{financialSummary.totalPending.toFixed(2)}$</div></div>
                <div className="bg-white p-6 rounded-xl shadow-sm"><div className="text-sm text-gray-600">Total Facturado</div><div className="text-3xl font-bold text-brand-text mt-2">{financialSummary.totalBilled.toFixed(2)}$</div></div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-semibold text-brand-text mb-4">Últimos Pagos Recibidos</h2>
                 <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Paciente</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Nº Factura</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Importe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-700">{new Date(payment.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-medium text-brand-text">{payment.patientName}</td>
                                        <td className="px-4 py-3 text-gray-700">{payment.invoiceNumber}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-700">{payment.amount.toFixed(2)}$</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     {recentPayments.length === 0 && <div className="text-center p-8 text-gray-500">No hay pagos registrados recientemente.</div>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
                <h2 className="text-2xl font-semibold text-brand-text mb-4">Facturas Pendientes de Cobro</h2>
                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Paciente</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Nº Factura</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Vencimiento</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pendingInvoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-brand-text">{patientMap.get(invoice.patientId) || 'Desconocido'}</td>
                                        <td className="px-4 py-3 text-gray-700">{invoice.invoiceNumber}</td>
                                        <td className={`px-4 py-3 text-gray-700 ${invoice.status === InvoiceStatus.Overdue ? 'font-bold text-red-600' : ''}`}>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
                                        <td className="px-4 py-3 text-right font-semibold text-brand-text">{invoice.total.toFixed(2)}$</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pendingInvoices.length === 0 && <div className="text-center p-8 text-gray-500">No hay facturas pendientes de cobro.</div>}
                </div>
            </div>
        </div>
    );
};

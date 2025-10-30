
import React, { useState, useMemo } from 'react';
import { Patient, Invoice, InvoiceStatus, InvoiceItem, Payment, PaymentMethod } from '../types';
import { PlusIcon, TrashIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from './Icons';
import { Modal } from './Modal';

type BillingProps = {
    patient: Patient;
    invoices: Invoice[];
    onAddInvoice: (newInvoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'>) => Invoice;
    onUpdateInvoice: (updatedInvoice: Invoice) => void;
};

const InvoiceEditor: React.FC<{ patient: Patient, onSave: (invoiceData: Omit<Invoice, 'id'|'invoiceNumber'|'status'>) => void, onClose: () => void }> = ({ patient, onSave, onClose }) => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [issueDate, setIssueDate] = useState(today);
    const [dueDate, setDueDate] = useState(thirtyDaysFromNow);
    const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([{ description: 'Sesión de Terapia', quantity: 1, unitPrice: 50 }]);

    const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);

    const handleSave = () => {
        const newInvoiceData = {
            patientId: patient.id,
            issueDate,
            dueDate,
            items: items.map((item, index) => ({...item, id: `item-${Date.now()}-${index}`})),
            payments: []
        };
        onSave(newInvoiceData);
        onClose();
    };

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-sm font-medium text-gray-700">Paciente</label><p className="mt-1 p-2 bg-gray-100 rounded-md">{patient.name}</p></div>
                <div></div>
                <div><label className="block text-sm font-medium text-gray-700">Fecha de Emisión</label><input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" /></div>
            </div>
            
            <h4 className="font-semibold mb-2">Conceptos</h4>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center border-t pt-3">
                        <input type="text" placeholder="Descripción" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="col-span-12 md:col-span-6 border-gray-300 rounded-md shadow-sm bg-white text-brand-text" />
                        <input type="number" placeholder="Cant." value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="col-span-4 md:col-span-2 border-gray-300 rounded-md shadow-sm bg-white text-brand-text" />
                        <input type="number" placeholder="Precio" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} className="col-span-4 md:col-span-2 border-gray-300 rounded-md shadow-sm bg-white text-brand-text" />
                        <span className="col-span-2 md:col-span-1 text-right self-center">{(item.quantity * item.unitPrice).toFixed(2)}$</span>
                        <button onClick={() => removeItem(index)} className="col-span-2 md:col-span-1 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5 mx-auto" /></button>
                    </div>
                ))}
            </div>
            <button onClick={addItem} className="mt-2 text-sm text-brand-primary font-semibold hover:underline">+ Añadir línea</button>

            <div className="mt-6 flex justify-end">
                <div className="text-right">
                    <p><span className="font-semibold">Subtotal:</span> {subtotal.toFixed(2)}$</p>
                    <p className="text-xl font-bold"><span className="font-semibold">Total:</span> {subtotal.toFixed(2)}$</p>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Guardar Factura</button>
            </div>
        </div>
    );
};


const PaymentModal: React.FC<{invoice: Invoice, onSave: (payment: Omit<Payment, 'id'>) => void, onClose: () => void}> = ({ invoice, onSave, onClose }) => {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDue = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const remainingAmount = totalDue - totalPaid;

    const [amount, setAmount] = useState(remainingAmount);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Transfer);

    const handleSave = () => {
        onSave({amount, date, method});
        onClose();
    };

    return (
        <div>
            <p className="mb-4">Añadir pago a la factura <span className="font-semibold">{invoice.invoiceNumber}</span>. Pendiente: {remainingAmount.toFixed(2)}$</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Importe</label><input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text"/></div>
                <div className="col-span-1 sm:col-span-2"><label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                    <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text">
                        {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Registrar Pago</button>
            </div>
        </div>
    );
};

const InvoiceDetailModal: React.FC<{ invoice: Invoice, onAddPayment: (payment: Omit<Payment, 'id'>) => void, onClose: () => void }> = ({ invoice, onAddPayment, onClose }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const paid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const pending = total - paid;
    
    return (
        <>
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
                <div><span className="font-semibold text-gray-600">Nº Factura:</span> {invoice.invoiceNumber}</div>
                <div><span className="font-semibold text-gray-600">Estado:</span> <InvoiceStatusBadge status={invoice.status} /></div>
                <div><span className="font-semibold text-gray-600">Fecha Emisión:</span> {new Date(invoice.issueDate).toLocaleDateString()}</div>
                <div><span className="font-semibold text-gray-600">Fecha Vencimiento:</span> {new Date(invoice.dueDate).toLocaleDateString()}</div>
            </div>
            <h4 className="font-semibold mb-2 text-brand-text">Conceptos</h4>
            <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-sm min-w-[400px]">
                    <thead><tr className="border-b"><th className="py-2">Descripción</th><th>Cant.</th><th>P. Unit.</th><th className="text-right">Total</th></tr></thead>
                    <tbody>{invoice.items.map(item => <tr key={item.id}><td className="py-1">{item.description}</td><td>{item.quantity}</td><td>{item.unitPrice.toFixed(2)}$</td><td className="text-right">{(item.quantity * item.unitPrice).toFixed(2)}$</td></tr>)}</tbody>
                </table>
            </div>
            <div className="flex justify-end mb-6"><div className="w-full sm:w-1/2 md:w-1/3"><div className="flex justify-between border-t pt-2"><span className="font-semibold">Total:</span><span className="font-bold">{total.toFixed(2)}$</span></div></div></div>
            
            <h4 className="font-semibold mb-2 text-brand-text">Pagos</h4>
            {invoice.payments.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[400px]">
                        <thead><tr className="border-b"><th className="py-2">Fecha</th><th>Método</th><th className="text-right">Importe</th></tr></thead>
                        <tbody>{invoice.payments.map(p => <tr key={p.id}><td className="py-1">{new Date(p.date).toLocaleDateString()}</td><td>{p.method}</td><td className="text-right">{p.amount.toFixed(2)}$</td></tr>)}</tbody>
                    </table>
                </div>
            ) : <p className="text-sm text-gray-500">No hay pagos registrados.</p>}
            <div className="flex justify-end mt-2"><div className="w-full sm:w-1/2 md:w-1/3"><div className="flex justify-between border-t pt-2"><span className="font-semibold">Total Pagado:</span><span className="font-bold text-green-600">{paid.toFixed(2)}$</span></div><div className="flex justify-between"><span className="font-semibold">Pendiente:</span><span className="font-bold text-red-600">{pending.toFixed(2)}$</span></div></div></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cerrar</button>
            {pending > 0 && <button onClick={() => setShowPaymentModal(true)} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Añadir Pago</button>}
        </div>
        {showPaymentModal && <Modal title="Registrar Pago" onClose={() => setShowPaymentModal(false)}><PaymentModal invoice={invoice} onSave={onAddPayment} onClose={() => setShowPaymentModal(false)}/></Modal>}
        </>
    );
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

export const Billing: React.FC<BillingProps> = ({ patient, invoices, onAddInvoice, onUpdateInvoice }) => {
    const [showInvoiceEditor, setShowInvoiceEditor] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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

    const handleAddPayment = (invoice: Invoice, paymentData: Omit<Payment, 'id'>) => {
        const newPayment: Payment = { ...paymentData, id: `pay-${Date.now()}` };
        const updatedInvoice = { ...invoice, payments: [...invoice.payments, newPayment] };

        const total = updatedInvoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const paid = updatedInvoice.payments.reduce((sum, p) => sum + p.amount, 0);

        if (paid >= total) {
            updatedInvoice.status = InvoiceStatus.Paid;
        }

        onUpdateInvoice(updatedInvoice);
        setSelectedInvoice(updatedInvoice);
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-brand-text">Facturación</h2>
                <button onClick={() => setShowInvoiceEditor(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition">
                    <PlusIcon className="w-5 h-5" />
                    Crear Factura
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Total Facturado</div><div className="text-2xl font-bold text-brand-text">{financialSummary.totalBilled.toFixed(2)}$</div></div>
                <div className="bg-green-50 p-4 rounded-lg"><div className="text-sm text-green-800">Total Cobrado</div><div className="text-2xl font-bold text-green-700">{financialSummary.totalPaid.toFixed(2)}$</div></div>
                <div className="bg-red-50 p-4 rounded-lg"><div className="text-sm text-red-800">Pendiente de Cobro</div><div className="text-2xl font-bold text-red-700">{financialSummary.totalPending.toFixed(2)}$</div></div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Nº Factura</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Fecha Emisión</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoices.map(invoice => {
                                const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
                                return (
                                    <tr key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="hover:bg-gray-50 cursor-pointer">
                                        <td className="px-4 py-3 font-medium text-brand-primary">{invoice.invoiceNumber}</td>
                                        <td className="px-4 py-3 text-gray-700">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-gray-700">{total.toFixed(2)}$</td>
                                        <td className="px-4 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                 {invoices.length === 0 && <div className="text-center p-8 text-gray-500">No hay facturas para este paciente.</div>}
            </div>

            {showInvoiceEditor && <Modal title="Crear Nueva Factura" onClose={() => setShowInvoiceEditor(false)}><InvoiceEditor patient={patient} onSave={onAddInvoice} onClose={() => setShowInvoiceEditor(false)} /></Modal>}
            {selectedInvoice && <Modal title="Detalle de Factura" onClose={() => setSelectedInvoice(null)}><InvoiceDetailModal invoice={selectedInvoice} onAddPayment={(p) => handleAddPayment(selectedInvoice, p)} onClose={() => setSelectedInvoice(null)} /></Modal>}
        </div>
    );
};

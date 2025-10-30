
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  size: number; // en bytes
  dataUrl: string; // Contenido del archivo en Base64 para almacenamiento local
}

export interface Note {
  id: string;
  date: string;
  content: string;
  attachments: Attachment[];
}

export enum PatientStatus {
  Active = 'Activo',
  Inactive = 'Inactivo',
  OnHold = 'En Pausa'
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  avatarUrl: string;
  status: PatientStatus;
  tags: string[];
  notes: Note[];
}

// --- Tipos para Facturación ---

export enum InvoiceStatus {
  Paid = 'Pagada',
  Pending = 'Pendiente',
  Overdue = 'Vencida',
}

export enum PaymentMethod {
    Cash = 'Efectivo',
    Transfer = 'Transferencia',
    Card = 'Tarjeta',
    Other = 'Otro',
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Payment {
    id: string;
    date: string;
    amount: number;
    method: PaymentMethod;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    patientId: string;
    issueDate: string;
    dueDate: string;
    items: InvoiceItem[];
    status: InvoiceStatus;
    payments: Payment[];
}

// --- Tipos para el Historial Cronológico ---

export enum TimelineEventItemType {
    Note = 'NOTE',
    Invoice = 'INVOICE',
    Payment = 'PAYMENT',
}

export type TimelinePayment = Payment & {
    invoiceNumber: string;
    invoiceId: string;
};

export type TimelineEvent = {
    date: string; // Cadena ISO para ordenar
    type: TimelineEventItemType;
    data: Note | Invoice | TimelinePayment;
};

// --- Tipos para Autenticación ---

export interface User {
  email: string;
  hashedPassword: string;
}

// --- Tipos para Agenda ---

export enum AppointmentStatus {
    Scheduled = 'Programada',
    Completed = 'Completada',
    Cancelled = 'Cancelada',
}

export interface Appointment {
    id: string;
    patientId: string;
    title: string;
    start: string; // ISO String
    end: string;   // ISO String
    status: AppointmentStatus;
    notes?: string;
}

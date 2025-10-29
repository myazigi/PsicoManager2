import { Patient, PatientStatus, Invoice, InvoiceStatus, PaymentMethod } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Ana García',
    email: 'ana.garcia@example.com',
    phone: '555-0101',
    joinDate: '2023-01-15',
    avatarUrl: 'https://picsum.photos/seed/p1/200',
    status: PatientStatus.Active,
    tags: ['Ansiedad', 'TCC'],
    notes: [
      {
        id: 'n1-1',
        date: '2023-01-22',
        content: 'Primera sesión. Se exploraron los motivos de consulta. Ana reporta altos niveles de ansiedad en situaciones sociales. Se establece un buen rapport.',
        attachments: [],
      },
      {
        id: 'n1-2',
        date: '2023-01-29',
        content: 'Se trabajó en la identificación de pensamientos automáticos negativos. Se asignó como tarea un registro de pensamientos. Ana muestra buena disposición.',
        attachments: [
          { id: 'a1-2-1', fileName: 'registro_pensamientos.pdf', fileType: 'application/pdf', size: 125000, dataUrl: '#' }
        ],
      },
    ],
  },
  {
    id: 'p2',
    name: 'Carlos Martínez',
    email: 'carlos.m@example.com',
    phone: '555-0102',
    joinDate: '2022-11-05',
    avatarUrl: 'https://picsum.photos/seed/p2/200',
    status: PatientStatus.Active,
    tags: ['Depresión', 'Adolescente'],
    notes: [
      {
        id: 'n2-1',
        date: '2022-11-12',
        content: 'Carlos presenta síntomas de estado de ánimo bajo y anhedonia. Dificultades en el ámbito escolar. Se inicia terapia de activación conductual.',
        attachments: [],
      },
    ],
  },
  {
    id: 'p3',
    name: 'Luisa Fernández',
    email: 'luisa.f@example.com',
    phone: '555-0103',
    joinDate: '2023-03-10',
    avatarUrl: 'https://picsum.photos/seed/p3/200',
    status: PatientStatus.Inactive,
    tags: ['Estrés Laboral'],
    notes: [
      {
        id: 'n3-1',
        date: '2023-03-17',
        content: 'Se abordaron técnicas de manejo del estrés y mindfulness. Luisa parece receptiva a las técnicas propuestas. Se le proporcionaron ejercicios para practicar en casa.',
        attachments: [
           { id: 'a3-1-1', fileName: 'guia_mindfulness.docx', fileType: 'application/msword', size: 340000, dataUrl: '#' }
        ],
      },
    ],
  },
  {
    id: 'p4',
    name: 'Javier Rodriguez',
    email: 'javier.r@example.com',
    phone: '555-0104',
    joinDate: '2023-05-20',
    avatarUrl: 'https://picsum.photos/seed/p4/200',
    status: PatientStatus.OnHold,
    tags: ['Terapia de Pareja'],
    notes: [
        {
            id: 'n4-1',
            date: '2023-05-27',
            content: 'Sesión conjunta con su pareja. Se exploraron patrones de comunicación. Ambos expresaron su deseo de mejorar la relación. Se estableció un plan de trabajo inicial.',
            attachments: [],
        },
    ]
  }
];

export const MOCK_INVOICES: Invoice[] = [
    {
        id: 'inv1',
        invoiceNumber: '2024-001',
        patientId: 'p1',
        issueDate: '2024-05-29',
        dueDate: '2024-06-28',
        items: [
            { id: 'item1', description: 'Sesión de Terapia Cognitivo-Conductual', quantity: 1, unitPrice: 50 },
        ],
        status: InvoiceStatus.Paid,
        payments: [
            { id: 'pay1', date: '2024-06-10', amount: 50, method: PaymentMethod.Transfer }
        ]
    },
    {
        id: 'inv2',
        invoiceNumber: '2024-002',
        patientId: 'p2',
        issueDate: '2024-05-12',
        dueDate: '2024-06-12',
        items: [
            { id: 'item2', description: 'Sesión de Terapia para Adolescentes', quantity: 1, unitPrice: 60 },
        ],
        status: InvoiceStatus.Paid,
        payments: [
             { id: 'pay2', date: '2024-05-20', amount: 60, method: PaymentMethod.Cash }
        ]
    },
    {
        id: 'inv3',
        invoiceNumber: '2024-003',
        patientId: 'p1',
        issueDate: '2024-06-05',
        dueDate: '2024-07-05',
        items: [
            { id: 'item3', description: 'Sesión de Terapia Cognitivo-Conductual', quantity: 1, unitPrice: 50 },
            { id: 'item4', description: 'Material Adicional', quantity: 1, unitPrice: 10 },
        ],
        status: InvoiceStatus.Pending,
        payments: []
    },
     {
        id: 'inv4',
        invoiceNumber: '2024-004',
        patientId: 'p3',
        issueDate: '2024-04-17',
        dueDate: '2024-05-17',
        items: [
            { id: 'item5', description: 'Sesión Manejo del Estrés', quantity: 1, unitPrice: 55 },
        ],
        status: InvoiceStatus.Overdue,
        payments: []
    },
];
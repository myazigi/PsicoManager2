
import React, { useState, useCallback, useRef } from 'react';
import { Patient, Note, Invoice, PatientStatus, Attachment } from '../types';
import { summarizeNotes } from '../services/geminiService';
import { SparklesIcon, PlusIcon, AttachmentIcon, DocumentTextIcon, ClockIcon, XMarkIcon } from './Icons';
import { Billing } from './Billing';
import { PatientHistory } from './PatientHistory';

interface PatientDetailProps {
  patient: Patient;
  invoices: Invoice[];
  onUpdatePatient: (updatedPatient: Patient) => void;
  onAddInvoice: (newInvoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'>) => Invoice;
  onUpdateInvoice: (updatedInvoice: Invoice) => void;
}

const NoteEditor: React.FC<{onSave: (note: Note) => void; onCancel: () => void}> = ({ onSave, onCancel }) => {
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState<Omit<Attachment, 'id'>[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    const newAttachment: Omit<Attachment, 'id'> = {
                        fileName: file.name,
                        fileType: file.type,
                        size: file.size,
                        dataUrl: loadEvent.target?.result as string,
                    };
                    setAttachments(prev => [...prev, newAttachment]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSave = () => {
        if (content.trim() || attachments.length > 0) {
            const newNote: Note = {
                id: `n-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                content,
                attachments: attachments.map((att, i) => ({ ...att, id: `att-${Date.now()}-${i}` })),
            };
            onSave(newNote);
        }
    };
    
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                rows={5}
                placeholder="Escribe la nota de la sesión aquí..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            ></textarea>
            
            {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                    <h4 className="text-sm font-semibold text-brand-muted">Archivos para adjuntar:</h4>
                    <div className="flex flex-wrap gap-2">
                        {attachments.map((att, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-100 border border-gray-300 text-sm px-3 py-1 rounded-full">
                               <AttachmentIcon className="w-4 h-4 text-brand-muted" />
                               <span className="max-w-[200px] truncate" title={att.fileName}>{att.fileName}</span>
                               <button onClick={() => removeAttachment(index)} className="text-gray-500 hover:text-red-600">
                                   <XMarkIcon className="w-4 h-4" />
                               </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end items-center mt-3 gap-3">
                 <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                 />
                <button 
                  type="button" 
                  className="p-2 text-brand-muted hover:text-brand-text"
                  title="Adjuntar archivo"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AttachmentIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition"
                >
                    Guardar Nota
                </button>
            </div>
        </div>
    );
}

const NotesView: React.FC<{patient: Patient, onUpdatePatient: (updatedPatient: Patient) => void}> = ({patient, onUpdatePatient}) => {
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  const handleSummarize = useCallback(async () => {
    setIsSummarizing(true);
    setSummary('');
    const result = await summarizeNotes(patient.name, patient.notes);
    setSummary(result);
    setIsSummarizing(false);
  }, [patient.name, patient.notes]);
  
  const handleSaveNote = (newNote: Note) => {
    const updatedPatient = {
        ...patient,
        notes: [newNote, ...patient.notes],
    };
    onUpdatePatient(updatedPatient);
    setShowNoteEditor(false);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-brand-text">Notas de Sesión</h2>
          <div className="flex items-center gap-2">
            <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-secondary font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-wait"
            >
                <SparklesIcon className="w-5 h-5" />
                {isSummarizing ? 'Resumiendo...' : 'Resumen IA'}
            </button>
            <button
                onClick={() => setShowNoteEditor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition"
            >
                <PlusIcon className="w-5 h-5" />
                Nueva Nota
            </button>
          </div>
        </div>
        
        {isSummarizing && <div className="text-center p-8 text-brand-muted">Generando resumen inteligente...</div>}
        
        {summary && (
          <div className="prose prose-sm max-w-none bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-yellow-900">Resumen Clínico con IA</h3>
            {summary.split('\n').map((line, i) => <p key={i} className="my-1">{line}</p>)}
          </div>
        )}

        {showNoteEditor && <NoteEditor onSave={handleSaveNote} onCancel={() => setShowNoteEditor(false)} />}

        <div className="space-y-4 mt-4">
          {patient.notes.map(note => (
            <div key={note.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-brand-secondary">{new Date(note.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="mt-2 text-brand-text whitespace-pre-wrap">{note.content}</p>
              {note.attachments.length > 0 && (
                 <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-brand-muted mb-2">Archivos Adjuntos:</h4>
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
          ))}
        </div>
    </>
  )
}

// Componente para el selector de estado del paciente
const PatientStatusChanger: React.FC<{ patient: Patient; onUpdatePatient: (patient: Patient) => void; }> = ({ patient, onUpdatePatient }) => {
  const getStatusClasses = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.Active:
        return 'bg-green-100 text-green-800 border-green-300 focus:ring-green-500';
      case PatientStatus.Inactive:
        return 'bg-gray-100 text-gray-800 border-gray-300 focus:ring-gray-500';
      case PatientStatus.OnHold:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 focus:ring-yellow-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 focus:ring-gray-500';
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as PatientStatus;
    onUpdatePatient({ ...patient, status: newStatus });
  };

  return (
    <div className="mt-2">
      <label htmlFor="patient-status" className="sr-only">
        Estado del Paciente
      </label>
      <select
        id="patient-status"
        value={patient.status}
        onChange={handleStatusChange}
        className={`text-sm font-medium rounded-full py-1 pl-3 pr-8 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getStatusClasses(patient.status)}`}
      >
        {Object.values(PatientStatus).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export const PatientDetail: React.FC<PatientDetailProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'billing' | 'history'>('notes');
  const { patient, invoices, onUpdatePatient, onAddInvoice, onUpdateInvoice } = props;
  
  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex items-start space-x-4">
          <img src={patient.avatarUrl} alt={patient.name} className="w-20 h-20 rounded-full object-cover" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brand-text">{patient.name}</h1>
            <p className="text-brand-muted">{patient.email}</p>
            <PatientStatusChanger patient={patient} onUpdatePatient={onUpdatePatient} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('notes')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notes'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 mr-2 inline-block"/>
              Notas de Sesión
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'billing'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SparklesIcon className="w-5 h-5 mr-2 inline-block" />
              Facturación
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="w-5 h-5 mr-2 inline-block" />
              Historial
            </button>
          </nav>
        </div>
        
        {activeTab === 'notes' && <NotesView patient={patient} onUpdatePatient={onUpdatePatient} />}
        {activeTab === 'billing' && <Billing patient={patient} invoices={invoices} onAddInvoice={onAddInvoice} onUpdateInvoice={onUpdateInvoice} />}
        {activeTab === 'history' && <PatientHistory patient={patient} invoices={invoices} />}

      </div>
    </div>
  );
};
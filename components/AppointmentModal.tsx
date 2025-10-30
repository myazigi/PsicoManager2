
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Appointment, Patient, AppointmentStatus } from '../types';
import { TrashIcon, EnvelopeIcon } from './Icons';
import { sendEmail } from '../utils/emailService';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    selectedDate: Date | null;
    patients: Patient[];
    onSave: (data: Appointment | Omit<Appointment, 'id'>) => void;
    onDelete: (appointmentId: string) => void;
    onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, appointment, selectedDate, patients, onSave, onDelete, onShowToast }) => {
    const [patientId, setPatientId] = useState('');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [status, setStatus] = useState<AppointmentStatus>(AppointmentStatus.Scheduled);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (appointment) {
            const startDate = new Date(appointment.start);
            setPatientId(appointment.patientId);
            setTitle(appointment.title);
            setDate(startDate.toISOString().split('T')[0]);
            setStartTime(startDate.toTimeString().substring(0, 5));
            setEndTime(new Date(appointment.end).toTimeString().substring(0, 5));
            setStatus(appointment.status);
            setNotes(appointment.notes || '');
        } else if (selectedDate) {
            setDate(selectedDate.toISOString().split('T')[0]);
            setStartTime('10:00');
            setEndTime('11:00');
            // Reset other fields
            setPatientId(patients.length > 0 ? patients[0].id : '');
            setTitle(patients.length > 0 ? `Sesión con ${patients[0].name}`: '');
            setStatus(AppointmentStatus.Scheduled);
            setNotes('');
        }
    }, [appointment, selectedDate, patients]);

    useEffect(() => {
        const selectedPatient = patients.find(p => p.id === patientId);
        if (selectedPatient && !appointment) { // Only auto-update title for new appointments
            setTitle(`Sesión con ${selectedPatient.name}`);
        }
    }, [patientId, patients, appointment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!patientId || !date || !startTime || !endTime) {
            setError('Paciente, fecha y horas son obligatorios.');
            return;
        }

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        if (startDateTime >= endDateTime) {
            setError('La hora de fin debe ser posterior a la de inicio.');
            return;
        }

        const appointmentData = {
            patientId,
            title,
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            status,
            notes,
        };
        
        if (appointment) {
            onSave({ ...appointmentData, id: appointment.id });
        } else {
            onSave(appointmentData);
        }
        onClose();
    };
    
    const handleDelete = () => {
        if (appointment) {
            onDelete(appointment.id);
            onClose();
        }
    };

    const handleSendReminder = async () => {
        if (!appointment) return;
        const patient = patients.find(p => p.id === appointment.patientId);
        if (!patient) return;

        const subject = 'Recordatorio de Cita';
        const body = `Hola ${patient.name},\n\nEste es un recordatorio de tu próxima sesión programada para el ${new Date(appointment.start).toLocaleString('es-ES')}.\n\nSaludos cordiales.`;
        
        const response = await sendEmail(patient.email, subject, body);
        onShowToast(response.message, response.success ? 'success' : 'error');
    };

    if (!isOpen) return null;

    return (
        <Modal title={appointment ? 'Editar Cita' : 'Nueva Cita'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                
                <div>
                    <label htmlFor="patient" className="block text-sm font-medium text-gray-700">Paciente</label>
                    <select id="patient" value={patientId} onChange={e => setPatientId(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text">
                        <option value="" disabled>Selecciona un paciente</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3">
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" />
                    </div>
                    <div>
                        <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">Inicio</label>
                        <input type="time" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" />
                    </div>
                    <div>
                        <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">Fin</label>
                        <input type="time" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" />
                    </div>
                </div>

                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select id="status" value={status} onChange={e => setStatus(e.target.value as AppointmentStatus)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text">
                       {Object.values(AppointmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas (Opcional)</label>
                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text"></textarea>
                </div>


                <div className="flex justify-between items-center gap-3 pt-4 border-t mt-6">
                    <div>
                        {appointment && (
                            <>
                            <button type="button" onClick={handleSendReminder} className="p-2 text-gray-500 hover:text-brand-primary transition" title="Enviar recordatorio por email"><EnvelopeIcon className="w-5 h-5"/></button>
                            <button type="button" onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 transition" title="Eliminar cita"><TrashIcon className="w-5 h-5"/></button>
                            </>
                        )}
                    </div>
                    <div className="flex gap-3">
                         <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Cancelar</button>
                         <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition">Guardar Cita</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

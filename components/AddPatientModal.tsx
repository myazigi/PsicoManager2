
import React, { useState } from 'react';
import { PatientStatus } from '../types';
import { Modal } from './Modal';

interface AddPatientModalProps {
  onClose: () => void;
  onAddPatient: (patientData: { name: string; email: string; phone: string; status: PatientStatus }) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ onClose, onAddPatient }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<PatientStatus>(PatientStatus.Active);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('El nombre y el email son obligatorios.');
      return;
    }
    setError('');
    onAddPatient({ name, email, phone, status });
  };

  return (
    <Modal title="Añadir Nuevo Paciente" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary bg-white text-brand-text"
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary bg-white text-brand-text"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary bg-white text-brand-text"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado Inicial</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PatientStatus)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary bg-white text-brand-text"
          >
            {Object.values(PatientStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition">
            Guardar Paciente
          </button>
        </div>
      </form>
    </Modal>
  );
};

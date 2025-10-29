
import React from 'react';
import { Patient, PatientStatus } from '../types';
import { TrashIcon } from './Icons';

interface PatientListItemProps {
    patient: Patient;
    isSelected: boolean;
    onSelect: () => void;
    onRequestDelete: () => void;
}

export const PatientListItem: React.FC<PatientListItemProps> = ({ patient, isSelected, onSelect, onRequestDelete }) => {
    const statusColor = {
        [PatientStatus.Active]: 'bg-green-100 text-green-800',
        [PatientStatus.Inactive]: 'bg-gray-100 text-gray-800',
        [PatientStatus.OnHold]: 'bg-yellow-100 text-yellow-800',
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Evita que el evento de clic se propague al 'li' y seleccione al paciente
        onRequestDelete();
    };
    
    return (
        <li
            onClick={onSelect}
            className={`group flex items-center p-3 space-x-3 rounded-lg cursor-pointer transition-colors relative ${isSelected ? 'bg-brand-primary text-white' : 'hover:bg-gray-100'}`}
        >
            <img className="w-12 h-12 rounded-full object-cover flex-shrink-0" src={patient.avatarUrl} alt={patient.name} />
            <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-brand-text'}`}>{patient.name}</p>
                <div className="flex items-center text-sm">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isSelected ? 'bg-white/30 text-white' : statusColor[patient.status]}`}>{patient.status}</span>
                </div>
            </div>
            <button 
                onClick={handleDeleteClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-200 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700 transition-opacity"
                title="Eliminar paciente"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </li>
    );
};

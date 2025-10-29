
import React from 'react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, children, onCancel, onConfirm }) => {
  return (
    <Modal title={title} onClose={onCancel}>
      <div>
        <div className="text-brand-text mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Eliminar Paciente
          </button>
        </div>
      </div>
    </Modal>
  );
};

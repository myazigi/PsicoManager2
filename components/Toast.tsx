import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Espera a que termine la animación de salida para llamar a onClose
        setTimeout(onClose, 300);
      }, 5000); // El toast desaparece después de 5 segundos

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ease-in-out z-[100]";
  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
  };
  const visibilityClasses = visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5";

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`}>
      {message}
    </div>
  );
};

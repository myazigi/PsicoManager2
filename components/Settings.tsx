
import React, { useState } from 'react';
import { User } from '../types';
import { hashPassword } from '../utils/encryption';

interface SettingsProps {
    user: User;
    onUpdateEmail: (newEmail: string) => Promise<void>;
    onUpdatePassword: (newPassword: string) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateEmail, onUpdatePassword }) => {
    const [newEmail, setNewEmail] = useState(user.email);
    const [emailSuccess, setEmailSuccess] = useState('');
    const [emailError, setEmailError] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError('');
        setEmailSuccess('');
        if (newEmail === user.email) {
            return setEmailError('El nuevo email es el mismo que el actual.');
        }
        try {
            // Aquí se podría añadir una validación de si el email ya existe
            await onUpdateEmail(newEmail);
            setEmailSuccess('¡Email actualizado con éxito!');
        } catch (error) {
            setEmailError('No se pudo actualizar el email.');
            console.error(error);
        }
    };
    
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmNewPassword) {
            return setPasswordError('Las nuevas contraseñas no coinciden.');
        }
        if (newPassword.length < 6) {
            return setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
        }

        const hashedCurrentPassword = await hashPassword(currentPassword);
        if (hashedCurrentPassword !== user.hashedPassword) {
            return setPasswordError('La contraseña actual es incorrecta.');
        }

        try {
            await onUpdatePassword(newPassword);
            setPasswordSuccess('¡Contraseña actualizada con éxito! Tus datos han sido re-encriptados.');
            // Limpiar campos
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            setPasswordError('No se pudo actualizar la contraseña.');
            console.error(error);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-brand-text mb-8">Ajustes de la Cuenta</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cambiar Email */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-semibold text-brand-text mb-4">Cambiar Email</h2>
                    <form onSubmit={handleEmailChange} className="space-y-4">
                        {emailError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{emailError}</p>}
                        {emailSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{emailSuccess}</p>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Nuevo Email</label>
                            <input
                                type="email"
                                id="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">
                                Guardar Email
                            </button>
                        </div>
                    </form>
                </div>

                {/* Cambiar Contraseña */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-semibold text-brand-text mb-4">Cambiar Contraseña</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {passwordError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{passwordError}</p>}
                        {passwordSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{passwordSuccess}</p>}
                        <div>
                            {/* Fix: Changed typo `cla ssName` to `className` */}
                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                            <input
                                type="password"
                                id="current-password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text"
                                required
                            />
                        </div>
                         <div>
                            {/* Fix: Changed typo `cla ssName` to `className` */}
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                            <input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text"
                                required
                            />
                        </div>
                         <div>
                            {/* Fix: Changed typo `cla ssName` to `className` */}
                            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                id="confirm-new-password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">
                                Cambiar Contraseña
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

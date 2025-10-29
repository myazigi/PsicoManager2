
import React, { useState } from 'react';
import { User } from '../types';
import { hashPassword } from '../utils/encryption';
import { Modal } from './Modal';
import { TrashIcon } from './Icons';

interface SettingsProps {
    user: User;
    isAdmin: boolean;
    allUsers: User[];
    onUpdateEmail: (newEmail: string) => Promise<void>;
    onUpdatePassword: (newPassword: string) => Promise<void>;
    onDeleteUser: (email: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, isAdmin, allUsers, onUpdateEmail, onUpdatePassword, onDeleteUser }) => {
    const [newEmail, setNewEmail] = useState(user.email);
    const [emailSuccess, setEmailSuccess] = useState('');
    const [emailError, setEmailError] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [confirmationText, setConfirmationText] = useState('');

    const handleRequestDelete = (userToDelete: User) => {
        setUserToDelete(userToDelete);
        setConfirmationText('');
    };

    const handleCancelDelete = () => {
        setUserToDelete(null);
        setConfirmationText('');
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.email);
            handleCancelDelete();
        }
    };

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError('');
        setEmailSuccess('');
        if (newEmail === user.email) {
            return setEmailError('El nuevo email es el mismo que el actual.');
        }
        try {
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
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-semibold text-brand-text mb-4">Cambiar Email</h2>
                    <form onSubmit={handleEmailChange} className="space-y-4">
                        {emailError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{emailError}</p>}
                        {emailSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{emailSuccess}</p>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Nuevo Email</label>
                            <input type="email" id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" required />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Guardar Email</button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-semibold text-brand-text mb-4">Cambiar Contraseña</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {passwordError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{passwordError}</p>}
                        {passwordSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{passwordSuccess}</p>}
                        <div>
                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                            <input type="password" id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" required />
                        </div>
                         <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                            <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" required />
                        </div>
                         <div>
                            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                            <input type="password" id="confirm-new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white text-brand-text" required />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Cambiar Contraseña</button>
                        </div>
                    </form>
                </div>
            </div>

            {isAdmin && (
                <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
                    <h2 className="text-2xl font-semibold text-brand-text mb-4">Administración de Usuarios</h2>
                    <div className="space-y-3">
                        {allUsers.filter(u => u.email !== user.email).map(otherUser => (
                            <div key={otherUser.email} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                <span className="text-brand-muted">{otherUser.email}</span>
                                <button onClick={() => handleRequestDelete(otherUser)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition">
                                    <TrashIcon className="w-4 h-4" />
                                    Eliminar
                                </button>
                            </div>
                        ))}
                         {allUsers.length <= 1 && <p className="text-center text-gray-500 py-4">No hay otros usuarios registrados.</p>}
                    </div>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-xl shadow-sm mt-8 border-2 border-red-200">
                <h2 className="text-2xl font-semibold text-red-700 mb-4">Zona de Peligro</h2>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-brand-text">Eliminar esta cuenta</h3>
                        <p className="text-sm text-brand-muted">Una vez que eliminas tu cuenta, no hay vuelta atrás. Por favor, ten la certeza.</p>
                    </div>
                    <button onClick={() => handleRequestDelete(user)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold">
                        Eliminar mi cuenta
                    </button>
                </div>
            </div>

            {userToDelete && (
                <Modal title={`Eliminar cuenta de ${userToDelete.email}`} onClose={handleCancelDelete}>
                    <div>
                        <p className="text-brand-text mb-4">
                            Esta acción es irreversible. Se eliminarán permanentemente todos los datos asociados a la cuenta de <span className="font-bold">{userToDelete.email}</span>, incluyendo pacientes, notas y facturas.
                        </p>
                        <p className="text-brand-text mb-4 font-semibold">
                            Para confirmar, escribe el email del usuario: <code className="text-red-600 bg-red-100 p-1 rounded">{userToDelete.email}</code>
                        </p>
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                            <button type="button" onClick={handleCancelDelete} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Cancelar</button>
                            <button 
                                type="button" 
                                onClick={handleConfirmDelete} 
                                disabled={confirmationText !== userToDelete.email}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-red-300 disabled:cursor-not-allowed font-semibold">
                                Entiendo, eliminar esta cuenta
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Patient, PatientStatus, Invoice, InvoiceStatus, User } from './types';
import { MOCK_PATIENTS, MOCK_INVOICES } from './constants';
import { SearchIcon, FilterIcon, UserGroupIcon, ChartBarIcon, LogoutIcon, PlusIcon } from './components/Icons';
import { PatientDetail } from './components/PatientDetail';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { AddPatientModal } from './components/AddPatientModal';
import { PatientListItem } from './components/PatientListItem';
import { ConfirmationModal } from './components/ConfirmationModal';
import { getEncryptionKey, encryptData, decryptData, hashPassword } from './utils/encryption';

const AuthScreen: React.FC<{ onAuthSuccess: (user: User, key: CryptoKey) => void }> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const getUsers = (): User[] => {
    const usersStr = localStorage.getItem('psiqueManager_users');
    return usersStr ? JSON.parse(usersStr) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('psiqueManager_users', JSON.stringify(users));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      return setError('No existe un usuario con ese email.');
    }

    const hashedInputPassword = await hashPassword(password);
    if (user.hashedPassword !== hashedInputPassword) {
      return setError('La contraseña es incorrecta.');
    }

    const key = await getEncryptionKey(password);
    onAuthSuccess(user, key);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    if (password.length < 6) {
        return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return setError('Ya existe un usuario con ese email.');
    }

    const hashedPassword = await hashPassword(password);
    const newUser: User = { email, hashedPassword };
    saveUsers([...users, newUser]);

    const key = await getEncryptionKey(password);
    onAuthSuccess(newUser, key);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-light">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-brand-text">PsiqueManager</h2>
          <p className="mt-2 text-center text-brand-muted">
            {mode === 'login' ? 'Inicia sesión para acceder a tu panel' : 'Crea una nueva cuenta'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {error && <p className="text-center text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
             <div><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="relative block w-full px-3 py-2 bg-white text-brand-text placeholder-gray-500 border border-gray-300 rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Email" /></div>
             <div><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`relative block w-full px-3 py-2 bg-white text-brand-text placeholder-gray-500 border border-gray-300 ${mode === 'login' ? 'rounded-b-md' : ''} focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm`} placeholder="Contraseña" /></div>
             {mode === 'register' && <div><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="relative block w-full px-3 py-2 bg-white text-brand-text placeholder-gray-500 border border-gray-300 rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Confirmar Contraseña" /></div>}
          </div>
          <div><button type="submit" className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md group hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">{mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</button></div>
        </form>
        <p className="text-sm text-center">
            {mode === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-medium text-brand-primary hover:underline ml-1">
                {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
            </button>
        </p>
      </div>
    </div>
  );
};


function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Función para guardar datos en localStorage, ahora dependiendo del usuario.
  const saveData = useCallback(async (key: 'patients' | 'invoices', data: any) => {
    if (encryptionKey && currentUser) {
      try {
        const stringData = JSON.stringify(data);
        const encryptedData = await encryptData(stringData, encryptionKey);
        localStorage.setItem(`psiqueManager_${key}_encrypted_${currentUser.email}`, encryptedData);
      } catch (error) {
        console.error(`Error al encriptar y guardar ${key}:`, error);
      }
    }
  }, [currentUser, encryptionKey]);

  useEffect(() => {
    if (patients.length > 0) saveData('patients', patients);
  }, [patients, saveData]);

  useEffect(() => {
    if (invoices.length > 0) saveData('invoices', invoices);
  }, [invoices, saveData]);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [currentView, setCurrentView] = useState<'patients' | 'reports' | 'settings'>('patients');
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [patientToDeleteId, setPatientToDeleteId] = useState<string | null>(null);

  const handleAuthSuccess = useCallback(async (user: User, key: CryptoKey) => {
    setCurrentUser(user);
    setEncryptionKey(key);

    const users = JSON.parse(localStorage.getItem('psiqueManager_users') || '[]');
    const isFirstUser = users.length === 1 && users[0].email === user.email;

    const encryptedPatients = localStorage.getItem(`psiqueManager_patients_encrypted_${user.email}`);
    if (encryptedPatients) {
        const decrypted = await decryptData(encryptedPatients, key);
        setPatients(JSON.parse(decrypted));
    } else if (isFirstUser) {
        setPatients(MOCK_PATIENTS); // Carga datos de prueba para el primer usuario
    } else {
        setPatients([]);
    }

    const encryptedInvoices = localStorage.getItem(`psiqueManager_invoices_encrypted_${user.email}`);
    if (encryptedInvoices) {
        const decrypted = await decryptData(encryptedInvoices, key);
        setInvoices(JSON.parse(decrypted));
    } else if (isFirstUser) {
        setInvoices(MOCK_INVOICES);
    } else {
        setInvoices([]);
    }
  }, []);
  
  const handleLogout = () => {
    setCurrentUser(null);
    setEncryptionKey(null);
    setPatients([]);
    setInvoices([]);
    setSelectedPatientId(null);
    setCurrentView('patients');
  };

  const handleUpdateUserEmail = async (newEmail: string) => {
    if (!currentUser) return;
    const users: User[] = JSON.parse(localStorage.getItem('psiqueManager_users') || '[]');
    const updatedUsers = users.map(u => u.email === currentUser.email ? { ...u, email: newEmail } : u);
    localStorage.setItem('psiqueManager_users', JSON.stringify(updatedUsers));
    
    // Migrar datos
    const patientData = localStorage.getItem(`psiqueManager_patients_encrypted_${currentUser.email}`);
    if(patientData) {
        localStorage.setItem(`psiqueManager_patients_encrypted_${newEmail}`, patientData);
        localStorage.removeItem(`psiqueManager_patients_encrypted_${currentUser.email}`);
    }
    const invoiceData = localStorage.getItem(`psiqueManager_invoices_encrypted_${currentUser.email}`);
    if(invoiceData) {
        localStorage.setItem(`psiqueManager_invoices_encrypted_${newEmail}`, invoiceData);
        localStorage.removeItem(`psiqueManager_invoices_encrypted_${currentUser.email}`);
    }
    
    setCurrentUser(prev => prev ? { ...prev, email: newEmail } : null);
  };

  const handleUpdateUserPassword = async (newPassword: string) => {
    if (!currentUser || !encryptionKey) return;
    const newKey = await getEncryptionKey(newPassword);
    const newHashedPassword = await hashPassword(newPassword);

    // Re-encriptar datos
    const reencryptedPatients = await encryptData(JSON.stringify(patients), newKey);
    localStorage.setItem(`psiqueManager_patients_encrypted_${currentUser.email}`, reencryptedPatients);
    
    const reencryptedInvoices = await encryptData(JSON.stringify(invoices), newKey);
    localStorage.setItem(`psiqueManager_invoices_encrypted_${currentUser.email}`, reencryptedInvoices);

    // Actualizar hash de contraseña
    const users: User[] = JSON.parse(localStorage.getItem('psiqueManager_users') || '[]');
    const updatedUsers = users.map(u => u.email === currentUser.email ? { ...u, hashedPassword: newHashedPassword } : u);
    localStorage.setItem('psiqueManager_users', JSON.stringify(updatedUsers));
    
    setEncryptionKey(newKey);
  };
  
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
        const firstPatient = patients.find(p => (statusFilter === 'all' || p.status === statusFilter));
        if (firstPatient) setSelectedPatientId(firstPatient.id);
    }
    if(selectedPatientId && !patients.some(p => p.id === selectedPatientId)) {
        setSelectedPatientId(null);
    }
  }, [patients, selectedPatientId, statusFilter]);

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prevPatients => prevPatients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleAddPatient = (patientData: { name: string; email: string; phone: string; status: PatientStatus }) => {
    const newPatient: Patient = { ...patientData, id: `p${Date.now()}`, joinDate: new Date().toISOString().split('T')[0], avatarUrl: `https://picsum.photos/seed/p${Date.now()}/200`, tags: [], notes: [] };
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setIsAddPatientModalOpen(false);
  };
  
  const handleAddInvoice = (newInvoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'>): Invoice => {
    const lastInvoiceNumber = invoices.map(inv => parseInt(inv.invoiceNumber.split('-')[1])).reduce((max, num) => Math.max(max, num), 0);
    const newInvoice: Invoice = { ...newInvoiceData, id: `inv-${Date.now()}`, invoiceNumber: `2024-${String(lastInvoiceNumber + 1).padStart(3, '0')}`, status: new Date(newInvoiceData.dueDate) < new Date() ? InvoiceStatus.Overdue : InvoiceStatus.Pending };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  };
  
  const handleRequestDeletePatient = (patientId: string) => setPatientToDeleteId(patientId);
  const handleCancelDelete = () => setPatientToDeleteId(null);

  const handleConfirmDelete = () => {
    if (!patientToDeleteId) return;
    const patientIndexToDelete = filteredPatients.findIndex(p => p.id === patientToDeleteId);
    setPatients(prev => prev.filter(p => p.id !== patientToDeleteId));
    setInvoices(prev => prev.filter(inv => inv.patientId !== patientToDeleteId));
    if (selectedPatientId === patientToDeleteId) {
        let newSelectedId: string | null = null;
        if (filteredPatients.length > 1) { newSelectedId = (patientIndexToDelete < filteredPatients.length - 1) ? filteredPatients[patientIndexToDelete + 1].id : filteredPatients[patientIndexToDelete - 1].id; }
        setSelectedPatientId(newSelectedId);
    }
    setPatientToDeleteId(null);
  };

  const filteredPatients = useMemo(() => {
    return patients
      .filter(patient => statusFilter === 'all' || patient.status === statusFilter)
      .filter(patient => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        return patient.name.toLowerCase().includes(lowerCaseSearch) || patient.notes.some(note => note.content.toLowerCase().includes(lowerCaseSearch));
      });
  }, [patients, searchTerm, statusFilter]);

  const selectedPatient = useMemo(() => {
    if (selectedPatientId && !patients.some(p => p.id === selectedPatientId)) return undefined;
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const selectedPatientInvoices = useMemo(() => {
    return invoices.filter(inv => inv.patientId === selectedPatientId);
  }, [invoices, selectedPatientId]);


  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-brand-text">
      <aside className="w-1/4 max-w-sm flex flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200"><h1 className="text-2xl font-bold text-brand-primary">PsiqueManager</h1><p className="text-sm text-brand-muted truncate">{currentUser.email}</p></div>
        
        <nav className="p-4 space-y-2">
            <button onClick={() => setCurrentView('patients')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${currentView === 'patients' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}><UserGroupIcon className="w-5 h-5" />Pacientes</button>
            <button onClick={() => setCurrentView('reports')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${currentView === 'reports' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}><ChartBarIcon className="w-5 h-5" />Informes</button>
             <button onClick={() => setCurrentView('settings')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${currentView === 'settings' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}><UserGroupIcon className="w-5 h-5" />Ajustes</button>
        </nav>
        
        {currentView === 'patients' && (
            <><div className="p-4 space-y-4 border-t border-gray-200">
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="w-5 h-5 text-gray-400" /></span><input type="text" placeholder="Buscar paciente o nota..." className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><FilterIcon className="w-5 h-5 text-gray-400" /></span><select className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border border-transparent rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PatientStatus | 'all')}><option value="all">Todos los estados</option><option value={PatientStatus.Active}>Activo</option><option value={PatientStatus.Inactive}>Inactivo</option><option value={PatientStatus.OnHold}>En Pausa</option></select></div>
                    <button onClick={() => setIsAddPatientModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-brand-primary transition"><PlusIcon className="w-5 h-5" />Añadir Paciente</button>
                </div>
                <div className="flex-1 px-4 pb-4 overflow-y-auto"><ul className="space-y-2">{filteredPatients.map(patient => (<PatientListItem key={patient.id} patient={patient} isSelected={selectedPatientId === patient.id} onSelect={() => setSelectedPatientId(patient.id)} onRequestDelete={() => handleRequestDeletePatient(patient.id)} />))}</ul></div></>
        )}
        <div className="mt-auto p-4 border-t border-gray-200"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"><LogoutIcon className="w-5 h-5" />Cerrar Sesión</button></div>
      </aside>

      <main className="flex-1 bg-brand-light">
        {currentView === 'patients' && selectedPatient ? (<PatientDetail patient={selectedPatient} invoices={selectedPatientInvoices} onUpdatePatient={handleUpdatePatient} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} />) 
        : currentView === 'patients' ? (<div className="flex items-center justify-center h-full"><div className="text-center text-brand-muted"><h2 className="text-2xl font-semibold">Bienvenido/a</h2><p>Selecciona un paciente de la lista para ver sus detalles o añade uno nuevo.</p></div></div>) 
        : currentView === 'reports' ? <Reports invoices={invoices} patients={patients}/>
        : <Settings user={currentUser} onUpdateEmail={handleUpdateUserEmail} onUpdatePassword={handleUpdateUserPassword} />}
      </main>

      {isAddPatientModalOpen && (<AddPatientModal onClose={() => setIsAddPatientModalOpen(false)} onAddPatient={handleAddPatient} />)}
      {patientToDeleteId && (<ConfirmationModal title="Confirmar Eliminación" onCancel={handleCancelDelete} onConfirm={handleConfirmDelete}><p>¿Estás seguro de que quieres eliminar a este paciente? Se borrarán todos sus datos, incluyendo notas y facturas. Esta acción no se puede deshacer.</p></ConfirmationModal>)}
    </div>
  );
}

export default App;

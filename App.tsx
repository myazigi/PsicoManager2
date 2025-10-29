
import React, { useState, useMemo, useEffect } from 'react';
// Fix: Import InvoiceStatus to resolve type error when assigning invoice status.
import { Patient, PatientStatus, Invoice, InvoiceStatus } from './types';
import { MOCK_PATIENTS, MOCK_INVOICES } from './constants';
import { SearchIcon, FilterIcon, UserGroupIcon, ChartBarIcon, LogoutIcon, PlusIcon } from './components/Icons';
import { PatientDetail } from './components/PatientDetail';
import { Reports } from './components/Reports';
import { AddPatientModal } from './components/AddPatientModal';

// Mock Login Screen Component defined in the same file to keep file count low
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be an API call
    if (email === 'psicologo@test.com' && password === 'password') {
      onLogin();
    } else {
      setError('Credenciales inválidas. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-light">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-brand-text">PsiqueManager</h2>
          <p className="mt-2 text-center text-brand-muted">Inicia sesión para acceder a tu panel</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <p className="text-center text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 bg-white text-brand-text placeholder-gray-500 border border-gray-300 rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Email (psicologo@test.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 bg-white text-brand-text placeholder-gray-500 border border-gray-300 rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Contraseña (password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md group hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PatientListItem: React.FC<{patient: Patient; isSelected: boolean; onSelect: () => void}> = ({patient, isSelected, onSelect}) => {
    const statusColor = {
        [PatientStatus.Active]: 'bg-green-100 text-green-800',
        [PatientStatus.Inactive]: 'bg-gray-100 text-gray-800',
        [PatientStatus.OnHold]: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
        <li
            onClick={onSelect}
            className={`flex items-center p-3 space-x-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-brand-primary text-white' : 'hover:bg-gray-100'}`}
        >
            <img className="w-12 h-12 rounded-full object-cover flex-shrink-0" src={patient.avatarUrl} alt={patient.name} />
            <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-brand-text'}`}>{patient.name}</p>
                <div className="flex items-center text-sm">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isSelected ? 'bg-white/30 text-white' : statusColor[patient.status]}`}>{patient.status}</span>
                </div>
            </div>
        </li>
    );
};

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [currentView, setCurrentView] = useState<'patients' | 'reports'>('patients');
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);


  const handleLogin = () => setIsAuthenticated(true);
  
  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prevPatients => prevPatients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleAddPatient = (patientData: { name: string; email: string; phone: string; status: PatientStatus }) => {
    const newPatient: Patient = {
      ...patientData,
      id: `p${Date.now()}`,
      joinDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://picsum.photos/seed/p${Date.now()}/200`,
      tags: [],
      notes: [],
    };
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setIsAddPatientModalOpen(false);
  };
  
  const handleAddInvoice = (newInvoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'>): Invoice => {
    const lastInvoiceNumber = invoices
        .map(inv => parseInt(inv.invoiceNumber.split('-')[1]))
        .reduce((max, num) => Math.max(max, num), 0);

    const newInvoice: Invoice = {
        ...newInvoiceData,
        id: `inv-${Date.now()}`,
        invoiceNumber: `2024-${String(lastInvoiceNumber + 1).padStart(3, '0')}`,
        // Fix: Use InvoiceStatus enum members instead of string literals to avoid type errors.
        status: new Date(newInvoiceData.dueDate) < new Date() ? InvoiceStatus.Overdue : InvoiceStatus.Pending,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  };

  const filteredPatients = useMemo(() => {
    return patients
      .filter(patient => statusFilter === 'all' || patient.status === statusFilter)
      .filter(patient => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const inName = patient.name.toLowerCase().includes(lowerCaseSearch);
        const inNotes = patient.notes.some(note => note.content.toLowerCase().includes(lowerCaseSearch));
        return inName || inNotes;
      });
  }, [patients, searchTerm, statusFilter]);

  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const selectedPatientInvoices = useMemo(() => {
    return invoices.filter(inv => inv.patientId === selectedPatientId);
  }, [invoices, selectedPatientId]);


  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-brand-text">
      <aside className="w-1/4 max-w-sm flex flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-brand-primary">PsiqueManager</h1>
        </div>
        
        <nav className="p-4 space-y-2">
            <button onClick={() => setCurrentView('patients')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${currentView === 'patients' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <UserGroupIcon className="w-5 h-5" />
                Pacientes
            </button>
            <button onClick={() => setCurrentView('reports')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${currentView === 'reports' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ChartBarIcon className="w-5 h-5" />
                Informes
            </button>
        </nav>
        
        {currentView === 'patients' && (
            <>
                <div className="p-4 space-y-4 border-t border-gray-200">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar paciente o nota..."
                            className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FilterIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <select
                            className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border border-transparent rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as PatientStatus | 'all')}
                        >
                            <option value="all">Todos los estados</option>
                            <option value={PatientStatus.Active}>Activo</option>
                            <option value={PatientStatus.Inactive}>Inactivo</option>
                            <option value={PatientStatus.OnHold}>En Pausa</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setIsAddPatientModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-brand-primary transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Añadir Paciente
                    </button>
                </div>
                <div className="flex-1 px-4 pb-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {filteredPatients.map(patient => (
                            <PatientListItem
                                key={patient.id}
                                patient={patient}
                                isSelected={selectedPatientId === patient.id}
                                onSelect={() => setSelectedPatientId(patient.id)}
                            />
                        ))}
                    </ul>
                </div>
            </>
        )}
        <div className="mt-auto p-4 border-t border-gray-200">
             <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
                <LogoutIcon className="w-5 h-5" />
                Cerrar Sesión
            </button>
        </div>

      </aside>

      <main className="flex-1 bg-brand-light">
        {currentView === 'patients' && selectedPatient ? (
            <PatientDetail 
                patient={selectedPatient} 
                invoices={selectedPatientInvoices}
                onUpdatePatient={handleUpdatePatient}
                onAddInvoice={handleAddInvoice}
                onUpdateInvoice={handleUpdateInvoice}
            />
        ) : currentView === 'patients' ? (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-brand-muted">
                    <h2 className="text-2xl font-semibold">Bienvenido/a</h2>
                    <p>Selecciona un paciente de la lista para ver sus detalles.</p>
                </div>
            </div>
        ) : (
            <Reports invoices={invoices} patients={patients}/>
        )}
      </main>

      {isAddPatientModalOpen && (
        <AddPatientModal
          onClose={() => setIsAddPatientModalOpen(false)}
          onAddPatient={handleAddPatient}
        />
      )}
    </div>
  );
}

export default App;

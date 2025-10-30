
import React, { useState, useMemo } from 'react';
import { Appointment, Patient } from '../types';
import { PlusIcon } from './Icons';
import { AppointmentModal } from './AppointmentModal';

type AgendaProps = {
    appointments: Appointment[];
    patients: Patient[];
    onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
    onUpdateAppointment: (appointment: Appointment) => void;
    onDeleteAppointment: (appointmentId: string) => void;
    onShowToast: (message: string, type: 'success' | 'error') => void;
};

const CalendarHeader: React.FC<{ currentDate: Date; onPrevMonth: () => void; onNextMonth: () => void; onToday: () => void; }> = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-text capitalize">{monthName}</h2>
            <div className="flex items-center gap-2">
                <button onClick={onPrevMonth} className="p-2 rounded-md hover:bg-gray-200 transition">‹</button>
                <button onClick={onToday} className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100 transition">Hoy</button>
                <button onClick={onNextMonth} className="p-2 rounded-md hover:bg-gray-200 transition">›</button>
            </div>
        </div>
    );
};

export const Agenda: React.FC<AgendaProps> = (props) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
    const lastDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate]);

    const daysInMonth = useMemo(() => {
        const days = [];
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from the previous Sunday

        for (let i = 0; i < 42; i++) { // 6 weeks grid
            days.push(new Date(startDate));
            startDate.setDate(startDate.getDate() + 1);
        }
        return days;
    }, [firstDayOfMonth]);
    
    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        props.appointments.forEach(apt => {
            const dateKey = new Date(apt.start).toISOString().split('T')[0];
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)?.push(apt);
        });
        return map;
    }, [props.appointments]);

    const handleOpenModalForNew = (date: Date) => {
        setSelectedDate(date);
        setSelectedAppointment(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (appointment: Appointment) => {
        setSelectedDate(null);
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
        setSelectedDate(null);
    };

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="p-4 md:p-6 lg:p-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold text-brand-text mb-6">Agenda</h1>
            <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm flex-1 flex flex-col">
                <CalendarHeader 
                    currentDate={currentDate} 
                    onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    onToday={() => setCurrentDate(new Date())}
                />
                <div className="grid grid-cols-7 gap-px border-l border-t border-gray-200 bg-gray-200 flex-1 min-h-[60vh]">
                    {weekDays.map(day => <div key={day} className="text-center font-semibold py-2 text-xs sm:text-sm bg-gray-50 text-brand-muted">{day}</div>)}
                    {daysInMonth.map((day, index) => {
                        const dateKey = day.toISOString().split('T')[0];
                        const dayAppointments = appointmentsByDate.get(dateKey) || [];
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isToday = dateKey === new Date().toISOString().split('T')[0];

                        return (
                            <div key={index} className={`relative flex flex-col p-1 sm:p-2 bg-white ${isCurrentMonth ? '' : 'bg-gray-50 text-gray-400'} cursor-pointer hover:bg-brand-light`} onClick={() => handleOpenModalForNew(day)}>
                                <span className={`self-end text-xs font-semibold ${isToday ? 'bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center' : 'p-1'}`}>
                                    {day.getDate()}
                                </span>
                                <div className="mt-1 space-y-1 overflow-y-auto">
                                    {dayAppointments.map(apt => (
                                        <button key={apt.id} onClick={(e) => { e.stopPropagation(); handleOpenModalForEdit(apt); }} className="w-full text-left text-xs p-1 rounded-md bg-brand-light text-brand-secondary hover:bg-brand-primary hover:text-white transition truncate">
                                            {apt.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {isModalOpen && (
                <AppointmentModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    appointment={selectedAppointment}
                    selectedDate={selectedDate}
                    patients={props.patients}
                    onSave={selectedAppointment ? props.onUpdateAppointment : props.onAddAppointment}
                    onDelete={props.onDeleteAppointment}
                    onShowToast={props.onShowToast}
                />
            )}
        </div>
    );
};

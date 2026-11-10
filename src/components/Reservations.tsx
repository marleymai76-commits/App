import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  Plus, 
  Search, 
  X, 
  Check, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import DashboardHeader from './DashboardHeader';
import { NativeNotificationService } from '../services/nativeNotification';
import { useNotificationStore } from '../lib/store';

interface Reservation {
  id: string;
  client: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
}

export default function Reservations({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [reservations, setReservations] = useState<Reservation[]>([
    { id: '1', client: 'Carlos Santos', phone: '+351 912 345 678', guests: 4, date: '2026-03-29', time: '20:00', status: 'confirmado' },
    { id: '2', client: 'Maria Ferreira', phone: '+351 923 456 789', guests: 2, date: '2026-03-29', time: '21:30', status: 'pendente' },
    { id: '3', client: 'João Pereira', phone: '+351 934 567 890', guests: 6, date: '2026-03-30', time: '13:00', status: 'confirmado' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGuests, setNewGuests] = useState(2);
  const [newDate, setNewDate] = useState('2026-03-31');
  const [newTime, setNewTime] = useState('19:30');

  const { addNotification } = useNotificationStore();

  const handleStatusChange = (id: string, status: Reservation['status']) => {
    setReservations(prev => prev.map(r => {
      if (r.id === id) {
        if (status === 'confirmado') {
          NativeNotificationService.notifyNewAppointment({
            client: r.client,
            date: r.date,
            time: r.time,
            guests: r.guests,
            phone: r.phone,
          });
        }
        return { ...r, status };
      }
      return r;
    }));
    toast.success(`Reserva ${status === 'confirmado' ? 'confirmada' : 'atualizada'}!`);
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim()) return;

    const newRes: Reservation = {
      id: Math.random().toString(36).substring(7),
      client: newClient.trim(),
      phone: newPhone.trim() || '+351 900 000 000',
      guests: Number(newGuests) || 2,
      date: newDate,
      time: newTime,
      status: 'confirmado',
    };

    setReservations(prev => [newRes, ...prev]);

    // Dispatch Native Browser Notification for critical event
    NativeNotificationService.notifyNewAppointment({
      client: newRes.client,
      date: newRes.date,
      time: newRes.time,
      guests: newRes.guests,
      phone: newRes.phone,
    });

    // Add to in-app notification store
    addNotification({
      title: 'Novo Agendamento Confirmado',
      message: `${newRes.client} para ${newRes.date} às ${newRes.time} (${newRes.guests} pessoas)`,
      type: 'success',
      critical: true,
    });

    toast.success(`Agendamento de ${newRes.client} confirmado com sucesso!`);
    setIsModalOpen(false);
    setNewClient('');
    setNewPhone('');
  };

  const filteredReservations = reservations.filter(r => 
    r.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <DashboardHeader 
        title="Gestão de Reservas" 
        subtitle="Agende mesas, controle horários e confirme presenças." 
        onMenuToggle={onMenuToggle}
      />

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center premium-card py-4">
        <div className="relative group flex-grow md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-100 group-focus-within:text-gold transition-all" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou telefone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-app border border-gold/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gold/50 outline-none transition-all w-full"
          />
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto gold-gradient text-premium-black px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-gold/10"
        >
          <Plus size={18} />
          Nova Reserva
        </button>
      </div>

      {/* Reservations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredReservations.map((res) => (
            <motion.div
              key={res.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="premium-card group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg gold-text-gradient">{res.client}</h3>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{res.guests} pessoas</p>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest border",
                  res.status === 'confirmado' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  res.status === 'pendente' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                  "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {res.status}
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs opacity-60">
                  <CalendarIcon size={14} className="text-gold" />
                  {res.date}
                </div>
                <div className="flex items-center gap-3 text-xs opacity-60">
                  <Clock size={14} className="text-gold" />
                  {res.time}
                </div>
                <div className="flex items-center gap-3 text-xs opacity-60">
                  <Phone size={14} className="text-gold" />
                  {res.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-6 border-t border-gold/5">
                {res.status === 'pendente' && (
                  <button 
                    onClick={() => handleStatusChange(res.id, 'confirmado')}
                    className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Check size={14} />
                    Confirmar
                  </button>
                )}
                {res.status !== 'cancelado' && (
                  <button 
                    onClick={() => handleStatusChange(res.id, 'cancelado')}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                )}
                <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold/5 text-gold hover:bg-gold/10 transition-all text-[10px] font-bold uppercase tracking-widest">
                  <Mail size={14} />
                  Lembrar
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card w-full max-w-lg"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold gold-text-gradient">Nova Reserva</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gold/10 rounded-full text-gold">
                <X size={24} />
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleCreateReservation}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Cliente</label>
                  <input 
                    type="text" 
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all" 
                    placeholder="Nome completo" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Telefone</label>
                  <input 
                    type="tel" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all" 
                    placeholder="+351 912 345 678" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Pessoas</label>
                  <input 
                    type="number" 
                    value={newGuests}
                    onChange={(e) => setNewGuests(Number(e.target.value))}
                    className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all" 
                    min={1} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Data</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Horário</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all" 
                    required 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-gold/10 hover:bg-gold/5 transition-all font-bold text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-8 py-3 gold-gradient text-premium-black rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-gold/20">
                  Agendar Reserva
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

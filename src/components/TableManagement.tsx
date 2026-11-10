import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Plus, 
  UserPlus, 
  DollarSign,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import DashboardHeader from './DashboardHeader';

interface Table {
  id: string;
  number: number;
  status: 'livre' | 'ocupada' | 'aguardando pedido' | 'aguardando pagamento';
  capacity: number;
  waiter?: string;
}

export default function TableManagement({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const data = await api.getTables();
      setTables(data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'livre': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ocupada': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'aguardando pedido': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'aguardando pagamento': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gold/10 text-gold border-gold/20';
    }
  };

  const getStatusIcon = (status: Table['status'], size = 14) => {
    switch (status) {
      case 'livre': return <CheckCircle2 size={size} />;
      case 'ocupada': return <Users size={size} />;
      case 'aguardando pedido': return <Clock size={size} />;
      case 'aguardando pagamento': return <DollarSign size={size} />;
      default: return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <DashboardHeader 
        title="Gestão de Mesas" 
        subtitle="Visualize o mapa de mesas, status em tempo real e atribuição de garçons." 
        onMenuToggle={onMenuToggle}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 premium-card py-4">
        {[
          { label: 'Livre', status: 'livre' },
          { label: 'Ocupada', status: 'ocupada' },
          { label: 'Aguardando Pedido', status: 'aguardando pedido' },
          { label: 'Aguardando Pagamento', status: 'aguardando pagamento' },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div className={cn("flex items-center justify-center p-1.5 rounded-lg", getStatusColor(item.status as any).split(' ')[0])}>
              {getStatusIcon(item.status as any, 12)}
            </div>
            <span className="text-xs font-bold opacity-60 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="premium-card aspect-square animate-pulse bg-gold/5" />
          ))
        ) : (
          tables.map((table) => (
            <motion.button
              key={table.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTable(table)}
              className={cn(
                "premium-card aspect-square flex flex-col items-center justify-center gap-3 transition-all relative group",
                selectedTable?.id === table.id ? "border-gold ring-2 ring-gold/20" : "border-gold/10"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-serif font-bold transition-all shadow-lg",
                table.status === 'livre' ? "bg-green-500/10 text-green-500" :
                table.status === 'ocupada' ? "bg-blue-500/10 text-blue-500" :
                table.status === 'aguardando pedido' ? "bg-yellow-500/10 text-yellow-500" :
                "bg-purple-500/10 text-purple-500"
              )}>
                {table.number}
              </div>
              
              <div className="text-center">
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                  getStatusColor(table.status)
                )}>
                  {getStatusIcon(table.status)}
                  {table.status}
                </div>
                {table.waiter && (
                  <p className="text-[10px] opacity-40 mt-1 font-bold">{table.waiter}</p>
                )}
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={14} className="text-gold" />
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Table Details Sidebar/Modal */}
      <AnimatePresence>
        {selectedTable && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full max-w-md bg-card-app border-l border-gold/10 h-full p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-serif font-bold",
                    getStatusColor(selectedTable.status)
                  )}>
                    {selectedTable.number}
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold gold-text-gradient">Mesa {selectedTable.number}</h2>
                    <p className="text-xs opacity-40 uppercase tracking-widest font-bold">Capacidade: {selectedTable.capacity} pessoas</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTable(null)} className="p-2 hover:bg-gold/10 rounded-full text-gold">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Status Update */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Alterar Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['livre', 'ocupada', 'aguardando pedido', 'aguardando pagamento'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setTables(tables.map(t => t.id === selectedTable.id ? { ...t, status: status as any } : t));
                          setSelectedTable({ ...selectedTable, status: status as any });
                          toast.success(`Mesa ${selectedTable.number} agora está ${status}`);
                        }}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                          selectedTable.status === status 
                            ? getStatusColor(status as any)
                            : "bg-gold/5 border-gold/10 opacity-40 hover:opacity-100"
                        )}
                      >
                        {getStatusIcon(status as any, 14)}
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Waiter Assignment */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Atribuir Garçom</h3>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold opacity-50" />
                    <select 
                      className="w-full bg-gold/5 border border-gold/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                      value={selectedTable.waiter || ''}
                      onChange={(e) => {
                        const waiter = e.target.value;
                        setTables(tables.map(t => t.id === selectedTable.id ? { ...t, waiter } : t));
                        setSelectedTable({ ...selectedTable, waiter });
                        toast.success(`Garçom ${waiter} atribuído à mesa ${selectedTable.number}`);
                      }}
                    >
                      <option value="">Nenhum</option>
                      <option value="Carlos">Carlos</option>
                      <option value="Ana">Ana</option>
                      <option value="Ricardo">Ricardo</option>
                    </select>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4 pt-8 border-t border-gold/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Ações Rápidas</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gold/5 border border-gold/10 hover:bg-gold/10 transition-all group">
                      <div className="flex items-center gap-3">
                        <Plus size={18} className="text-gold" />
                        <span className="text-sm font-bold">Novo Pedido</span>
                      </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gold/5 border border-gold/10 hover:bg-gold/10 transition-all group">
                      <div className="flex items-center gap-3">
                        <DollarSign size={18} className="text-gold" />
                        <span className="text-sm font-bold">Fechar Conta</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

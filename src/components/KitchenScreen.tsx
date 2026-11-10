import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Clock, CheckCircle2, AlertCircle, Play, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import DashboardHeader from './DashboardHeader';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface Order {
  id: string;
  table: number;
  items: OrderItem[];
  status: 'recebido' | 'preparando' | 'pronto';
  timestamp: Date;
}

export default function KitchenScreen({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '#SF-2001',
      table: 4,
      status: 'recebido',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      items: [
        { id: '1', name: 'Picanha Premium', quantity: 2, notes: 'Ponto menos' },
        { id: '2', name: 'Batata Frita', quantity: 1 },
      ]
    },
    {
      id: '#SF-2002',
      table: 2,
      status: 'preparando',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      items: [
        { id: '3', name: 'Risoto de Funghi', quantity: 1 },
        { id: '4', name: 'Vinho Tinto', quantity: 1 },
      ]
    },
    {
      id: '#SF-2003',
      table: 7,
      status: 'recebido',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      items: [
        { id: '5', name: 'Hambúrguer Gourmet', quantity: 3, notes: 'Sem cebola' },
      ]
    }
  ]);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast.success(`Pedido ${orderId} agora está ${newStatus}!`);
  };

  const getTimeElapsed = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    return `${minutes} min`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <DashboardHeader 
        title="Cozinha (KDS)" 
        subtitle="Gerencie os pedidos em tempo real e controle o fluxo de preparo." 
        onMenuToggle={onMenuToggle}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "premium-card flex flex-col h-full border-t-4",
                order.status === 'recebido' ? "border-t-yellow-500" :
                order.status === 'preparando' ? "border-t-blue-500" :
                "border-t-green-500"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-serif font-bold gold-text-gradient">Mesa {order.table}</h3>
                  <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{order.id}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border mb-2",
                    order.status === 'recebido' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                    order.status === 'preparando' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    "bg-green-500/10 text-green-500 border-green-500/20"
                  )}>
                    {order.status}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] opacity-40 font-bold">
                    <Clock size={10} />
                    {getTimeElapsed(order.timestamp)}
                  </div>
                </div>
              </div>

              <div className="flex-grow space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="p-3 bg-gold/5 rounded-xl border border-gold/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold">{item.name}</span>
                      <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-md">x{item.quantity}</span>
                    </div>
                    {item.notes && (
                      <p className="text-[10px] text-yellow-500 italic font-medium">Obs: {item.notes}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gold/5 grid grid-cols-2 gap-3">
                {order.status === 'recebido' && (
                  <button 
                    onClick={() => handleStatusChange(order.id, 'preparando')}
                    className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    <Play size={14} />
                    Iniciar Preparo
                  </button>
                )}
                {order.status === 'preparando' && (
                  <>
                    <button 
                      onClick={() => handleStatusChange(order.id, 'recebido')}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gold/5 text-gold hover:bg-gold/10 transition-all font-bold text-[10px] uppercase tracking-widest"
                    >
                      <X size={14} />
                      Recuar
                    </button>
                    <button 
                      onClick={() => handleStatusChange(order.id, 'pronto')}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all font-bold text-[10px] uppercase tracking-widest"
                    >
                      <Check size={14} />
                      Pronto
                    </button>
                  </>
                )}
                {order.status === 'pronto' && (
                  <button 
                    onClick={() => setOrders(orders.filter(o => o.id !== order.id))}
                    className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold/10 text-gold hover:bg-gold/20 transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    <CheckCircle2 size={14} />
                    Entregar
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

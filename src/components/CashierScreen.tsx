import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Receipt, 
  Search, 
  Table as TableIcon, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import DashboardHeader from './DashboardHeader';
import { NativeNotificationService } from '../services/nativeNotification';
import { useNotificationStore } from '../lib/store';

interface Table {
  id: string;
  number: number;
  status: 'livre' | 'ocupada' | 'aguardando pedido' | 'aguardando pagamento';
  capacity: number;
  waiter?: string;
  total?: number;
}

export default function CashierScreen({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix' | 'mbway' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const data = await api.getTables();
      // Mocking totals for tables awaiting payment
      setTables(data.map(t => ({
        ...t,
        total: t.status === 'aguardando pagamento' ? Math.random() * 500 + 50 : 0
      })));
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      toast.error('Selecione um método de pagamento!');
      return;
    }

    const currentTable = selectedTable;
    const currentMethod = paymentMethod;

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Processando pagamento...',
        success: () => {
          if (currentTable) {
            const amount = currentTable.total || 0;
            // Dispatch Native Browser Notification for critical event
            NativeNotificationService.notifyPaymentApproved({
              amount,
              method: currentMethod.toUpperCase(),
              client: `Mesa ${currentTable.number}`,
              description: `Fechamento de Conta Mesa ${currentTable.number}`,
            });

            // Add to in-app notification center
            useNotificationStore.getState().addNotification({
              title: 'Pagamento Aprovado',
              message: `Mesa ${currentTable.number}: R$ ${amount.toFixed(2)} recebido via ${currentMethod.toUpperCase()}`,
              type: 'success',
              critical: true,
            });
          }

          setTables(tables.map(t => t.id === selectedTable?.id ? { ...t, status: 'livre', total: 0 } : t));
          setSelectedTable(null);
          setPaymentMethod(null);
          return 'Pagamento realizado com sucesso!';
        },
        error: 'Erro ao processar pagamento.',
      }
    );
  };

  const paymentMethods = [
    { id: 'dinheiro', label: 'Dinheiro', icon: DollarSign },
    { id: 'cartao', label: 'Cartão', icon: CreditCard },
    { id: 'pix', label: 'PIX', icon: Smartphone },
    { id: 'mbway', label: 'MBWay', icon: Smartphone },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <DashboardHeader 
        title="Caixa e Pagamentos" 
        subtitle="Feche contas, processe pagamentos e emita recibos." 
        onMenuToggle={onMenuToggle}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tables List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center premium-card py-4">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Mesas Ativas</h3>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-100 group-focus-within:text-gold transition-all" />
              <input 
                type="text" 
                placeholder="Buscar mesa..." 
                className="bg-app border border-gold/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:border-gold/50 outline-none transition-all w-48"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tables.filter(t => t.status !== 'livre').map((table) => (
              <motion.button
                key={table.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTable(table)}
                className={cn(
                  "premium-card flex items-center justify-between p-6 transition-all border",
                  selectedTable?.id === table.id ? "border-gold ring-2 ring-gold/20" : "border-gold/10",
                  table.status === 'aguardando pagamento' ? "bg-purple-500/5" : "bg-gold/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-serif font-bold",
                    table.status === 'aguardando pagamento' ? "bg-purple-500/10 text-purple-500" : "bg-gold/10 text-gold"
                  )}>
                    {table.number}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest">{table.status}</p>
                    <p className="text-sm font-bold">Garçom: {table.waiter}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-serif font-bold gold-text-gradient">R$ {table.total?.toFixed(2)}</p>
                  {table.status === 'aguardando pagamento' && (
                    <span className="text-[8px] font-bold text-purple-500 animate-pulse uppercase tracking-widest">Aguardando</span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Payment Section */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedTable ? (
              <motion.div
                key="payment-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="premium-card p-8 flex flex-col h-full"
              >
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-serif font-bold gold-text-gradient">Fechar Conta</h3>
                  <button onClick={() => setSelectedTable(null)} className="p-2 hover:bg-gold/10 rounded-full text-gold">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8 flex-grow">
                  {/* Summary */}
                  <div className="p-6 bg-gold/5 rounded-2xl border border-gold/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">Total da Mesa {selectedTable.number}</p>
                      <p className="text-4xl font-serif font-bold gold-text-gradient">R$ {selectedTable.total?.toFixed(2)}</p>
                    </div>
                    <Receipt size={40} className="text-gold opacity-20" />
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Método de Pagamento</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border transition-all",
                            paymentMethod === method.id 
                              ? "bg-gold/10 border-gold text-gold shadow-lg shadow-gold/10" 
                              : "bg-gold/5 border-gold/10 opacity-60 hover:opacity-100"
                          )}
                        >
                          <method.icon size={20} />
                          <span className="text-xs font-bold uppercase tracking-widest">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-8 border-t border-gold/5">
                    <button 
                      onClick={handlePayment}
                      className="w-full gold-gradient text-premium-black py-4 rounded-xl font-bold shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                      <CheckCircle2 size={18} />
                      Confirmar Pagamento
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gold/5 border border-gold/10 hover:bg-gold/10 transition-all text-gold font-bold text-xs uppercase tracking-widest">
                      <Printer size={16} />
                      Imprimir Recibo
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="premium-card p-12 flex flex-col items-center justify-center text-center h-full opacity-20"
              >
                <TableIcon size={64} className="mb-6" />
                <h3 className="text-xl font-serif font-bold uppercase tracking-widest">Selecione uma mesa</h3>
                <p className="text-sm mt-2">Para iniciar o processo de fechamento de conta.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

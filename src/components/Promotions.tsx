import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Tag, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  XCircle,
  Percent,
  DollarSign,
  Package,
  Timer
} from 'lucide-react';
import { usePromotionStore, Promotion, PromotionType } from '../lib/store';
import { cn, sanitizeInput } from '../lib/utils';
import { toast } from 'sonner';
import DashboardHeader from './DashboardHeader';
import { api } from '../services/api';

export default function Promotions({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { promotions, addPromotion, updatePromotion, deletePromotion, togglePromotion, setPromotions } = usePromotionStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PromotionType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const [newPromo, setNewPromo] = useState<Omit<Promotion, 'id'>>({
    name: '',
    type: 'percentage',
    value: 0,
    categories: [],
    items: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    active: true
  });

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const data = await api.promotions.getAll();
        setPromotions(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        toast.error('Erro ao carregar promoções');
        setLoading(false);
      }
    };
    fetchPromos();
  }, [setPromotions]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sanitizedPromo = {
        ...newPromo,
        name: sanitizeInput(newPromo.name),
        categories: newPromo.categories.map(c => sanitizeInput(c))
      };
      const created = await api.promotions.create(sanitizedPromo);
      addPromotion(created);
      setIsAdding(false);
      toast.success('Promoção criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar promoção');
    }
  };

  const handleDelete = async (id: string) => {
    toast('Tem certeza que deseja excluir esta promoção?', {
      action: {
        label: 'Excluir',
        onClick: async () => {
          try {
            await api.promotions.delete(id);
            deletePromotion(id);
            toast.success('Promoção excluída');
          } catch (error) {
            toast.error('Erro ao excluir promoção');
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const handleToggle = async (id: string) => {
    const promo = promotions.find(p => p.id === id);
    if (!promo) return;
    try {
      await api.promotions.update(id, { active: !promo.active });
      togglePromotion(id);
      toast.success(`Promoção ${!promo.active ? 'ativada' : 'desativada'}`);
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const filteredPromos = (Array.isArray(promotions) ? promotions : []).filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const getPromoIcon = (type: PromotionType) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'combo': return <Package className="w-4 h-4" />;
      case 'happy_hour': return <Timer className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Gestão de Promoções" 
        subtitle="Crie e gerencie ofertas especiais para seus clientes." 
        onMenuToggle={onMenuToggle}
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input 
            type="text" 
            placeholder="Buscar promoções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card-app border border-border-app rounded-xl focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2.5 bg-card-app border border-border-app rounded-xl focus:outline-none focus:border-accent/50 text-sm"
          >
            <option value="all">Todos os Tipos</option>
            <option value="percentage">Percentual</option>
            <option value="fixed">Valor Fixo</option>
            <option value="combo">Combo</option>
            <option value="happy_hour">Happy Hour</option>
          </select>

          <button 
            onClick={() => setIsAdding(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 gold-gradient text-premium-black font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-gold/20"
          >
            <Plus className="w-4 h-4" />
            Nova Promoção
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPromos.map((promo) => (
            <motion.div
              key={promo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "premium-card group relative overflow-hidden",
                !promo.active && "opacity-60 grayscale"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {getPromoIcon(promo.type)}
                  {promo.type.replace('_', ' ')}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleToggle(promo.id)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {promo.active ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(promo.id)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-2 gold-text-gradient">{promo.name}</h3>
              
              <div className="space-y-3 text-xs opacity-60">
                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  <span>{promo.type === 'percentage' ? `${promo.value}% de desconto` : `R$ ${promo.value} de desconto`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
                </div>
                {promo.startTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{promo.startTime} às {promo.endTime}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border-app flex flex-wrap gap-2">
                {promo.categories.map(cat => (
                  <span key={cat} className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium">{cat}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal de Adição */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-premium-black border border-border-app rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-border-app flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold gold-text-gradient">Nova Promoção</h2>
                <button onClick={() => setIsAdding(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Nome da Promoção</label>
                    <input 
                      required
                      type="text" 
                      value={newPromo.name}
                      onChange={(e) => setNewPromo({...newPromo, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-border-app rounded-xl focus:outline-none focus:border-accent/50"
                      placeholder="Ex: Happy Hour de Verão"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Tipo</label>
                    <select 
                      value={newPromo.type}
                      onChange={(e) => setNewPromo({...newPromo, type: e.target.value as any})}
                      className="w-full px-4 py-3 bg-white/5 border border-border-app rounded-xl focus:outline-none focus:border-accent/50"
                    >
                      <option value="percentage">Percentual (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                      <option value="combo">Combo</option>
                      <option value="happy_hour">Happy Hour</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Valor do Desconto</label>
                    <input 
                      required
                      type="number" 
                      value={newPromo.value}
                      onChange={(e) => setNewPromo({...newPromo, value: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/5 border border-border-app rounded-xl focus:outline-none focus:border-accent/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Categorias (separadas por vírgula)</label>
                    <input 
                      type="text" 
                      onChange={(e) => setNewPromo({...newPromo, categories: e.target.value.split(',').map(s => s.trim())})}
                      className="w-full px-4 py-3 bg-white/5 border border-border-app rounded-xl focus:outline-none focus:border-accent/50"
                      placeholder="Ex: Bebidas, Carnes"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Data Início</label>
                    <input 
                      type="date" 
                      value={newPromo.startDate}
                      onChange={(e) => setNewPromo({...newPromo, startDate: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-border-app rounded-xl focus:outline-none focus:border-accent/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Data Fim</label>
                    <input 
                      type="date" 
                      value={newPromo.endDate}
                      onChange={(e) => setNewPromo({...newPromo, endDate: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-border-app rounded-xl focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-border-app">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-3 rounded-xl font-bold opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-3 gold-gradient text-premium-black font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-gold/20"
                  >
                    Salvar Promoção
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

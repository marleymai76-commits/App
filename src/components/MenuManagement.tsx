import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Camera, Check, X, Filter } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { cn, sanitizeInput } from '../lib/utils';
import DashboardHeader from './DashboardHeader';
import { useNicheStore, NICHE_CONFIGS, usePromotionStore } from '../lib/store';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  image: string;
  sizes?: { label: string; price: number }[];
  addons?: { label: string; price: number }[];
  isRodizio?: boolean;
}

export default function MenuManagement({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { niche } = useNicheStore();
  const nicheConfig = NICHE_CONFIGS[niche];
  const { promotions } = usePromotionStore();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const categories = nicheConfig.categories;

  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    category: categories[1] || 'Geral',
    price: 0,
    available: true,
    image: 'https://picsum.photos/seed/food/400/300',
    sizes: [],
    addons: [],
    isRodizio: false
  });

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({
        name: '',
        category: categories[1] || 'Geral',
        price: 0,
        available: true,
        image: 'https://picsum.photos/seed/food/400/300',
        sizes: [],
        addons: [],
        isRodizio: false
      });
    }
  }, [editingItem, categories]);

  const fetchMenu = async () => {
    try {
      const data = await api.getMenu();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast('Tem certeza que deseja excluir este item?', {
      action: {
        label: 'Excluir',
        onClick: () => {
          toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
              loading: 'Excluindo item...',
              success: () => {
                setItems(items.filter(item => item.id !== id));
                return 'Item excluído com sucesso!';
              },
              error: 'Erro ao excluir item.',
            }
          );
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const handleToggleAvailability = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
    toast.success('Disponibilidade atualizada!');
  };

  const filteredItems = items.map(item => {
    const activePromos = (Array.isArray(promotions) ? promotions : []).filter(p => 
      p.active && 
      (p.categories.includes(item.category) || p.items.includes(item.id))
    );
    return { ...item, activePromos };
  }).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <DashboardHeader 
        title="Gestão de Cardápio" 
        subtitle="Gerencie categorias, itens, preços e disponibilidade do seu menu." 
        onMenuToggle={onMenuToggle}
      />

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center premium-card py-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-100 group-focus-within:text-gold transition-all" />
            <input 
              type="text" 
              placeholder="Buscar no cardápio..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-app border border-gold/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gold/50 outline-none transition-all w-full md:w-64"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                  selectedCategory === cat 
                    ? "gold-gradient text-premium-black border-transparent shadow-lg shadow-gold/20" 
                    : "bg-gold/5 border-gold/10 opacity-60 hover:opacity-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto gold-gradient text-premium-black px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-gold/10"
        >
          <Plus size={18} />
          Novo Item
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="premium-card h-64 animate-pulse bg-gold/5" />
          ))
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-40">
            Nenhum item encontrado com os filtros atuais.
          </div>
        ) : (
          filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "premium-card group overflow-hidden flex flex-col h-full",
                !item.available && "opacity-60 grayscale-[0.5]"
              )}
            >
              <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleToggleAvailability(item.id)}
                    className={cn(
                      "p-2 rounded-lg backdrop-blur-md transition-all",
                      item.available ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    )}
                    title={item.available ? "Marcar como indisponível" : "Marcar como disponível"}
                  >
                    {item.available ? <Check size={16} /> : <X size={16} />}
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-1 rounded-md border border-gold/20">
                    {item.category}
                  </span>
                  {item.activePromos.length > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white px-2 py-1 rounded-md animate-pulse">
                      PROMO
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="font-serif font-bold text-lg mb-1 gold-text-gradient">{item.name}</h3>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-bold",
                    item.activePromos.length > 0 ? "text-xs line-through opacity-40" : "text-xl text-gold"
                  )}>
                    R$ {item.price.toFixed(2)}
                  </p>
                  {item.activePromos.length > 0 && (
                    <p className="text-xl font-bold text-red-500">
                      R$ {(item.price * (1 - (item.activePromos[0].type === 'percentage' ? item.activePromos[0].value / 100 : 0))).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-gold/5">
                <button 
                  onClick={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                  className="flex-grow flex items-center justify-center gap-2 py-2 rounded-lg bg-gold/5 hover:bg-gold/10 text-gold transition-all text-sm font-bold"
                >
                  <Edit2 size={14} />
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Item Modal (Simplified for Demo) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card w-full max-w-lg"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold gold-text-gradient">
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gold/10 rounded-full text-gold">
                <X size={24} />
              </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const sanitizedName = sanitizeInput(formData.name || '');
              toast.success(editingItem ? `Item ${sanitizedName} atualizado!` : `Item ${sanitizedName} criado!`);
              setIsModalOpen(false);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Nome</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all" 
                    placeholder="Ex: Picanha Premium" required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                  >
                    {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Preço Base (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all" 
                    placeholder="0.00" required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Foto</label>
                  <button type="button" className="w-full flex items-center justify-center gap-2 py-3 bg-gold/5 border border-gold/10 border-dashed rounded-xl text-gold text-sm hover:bg-gold/10 transition-all">
                    <Camera size={18} />
                    Upload Foto
                  </button>
                </div>
              </div>

              {/* Niche Specific Fields */}
              <div className="space-y-6 pt-4 border-t border-gold/5">
                {nicheConfig.features.sizes && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Tamanhos (P, M, G)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {['P', 'M', 'G'].map(size => (
                        <div key={size} className="space-y-1">
                          <label className="text-[10px] opacity-40">{size}</label>
                          <input 
                            type="number" 
                            placeholder="Preço"
                            className="w-full bg-gold/5 border border-gold/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-gold/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(nicheConfig.features.rodizio) && (
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="rodizio"
                      checked={formData.isRodizio}
                      onChange={(e) => setFormData({...formData, isRodizio: e.target.checked})}
                      className="w-4 h-4 accent-gold"
                    />
                    <label htmlFor="rodizio" className="text-sm font-medium opacity-70">Disponível no Rodízio</label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-gold/10 hover:bg-gold/5 transition-all font-bold text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-8 py-3 gold-gradient text-premium-black rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-gold/20">
                  {editingItem ? 'Salvar Alterações' : 'Criar Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

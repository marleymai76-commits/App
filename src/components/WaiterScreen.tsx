import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, ShoppingCart, Trash2, Send, X, Table as TableIcon, Utensils } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
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

interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
  selectedSize?: string;
}

export default function WaiterScreen({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { niche } = useNicheStore();
  const { promotions } = usePromotionStore();
  const nicheConfig = NICHE_CONFIGS[niche];
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isRodizioActive, setIsRodizioActive] = useState(false);

  const categories = nicheConfig.categories;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuData, tablesData] = await Promise.all([
        api.getMenu(),
        api.getTables()
      ]);
      setMenu(menuData);
      setTables(tablesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} adicionado!`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const handleSendOrder = () => {
    if (!selectedTable) {
      toast.error('Selecione uma mesa primeiro!');
      return;
    }
    if (cart.length === 0) {
      toast.error('O carrinho está vazio!');
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Enviando pedido para a cozinha...',
        success: () => {
          setCart([]);
          setSelectedTable(null);
          return 'Pedido enviado com sucesso!';
        },
        error: 'Erro ao enviar pedido.',
      }
    );
  };

  const filteredMenu = menu.map(item => {
    const activePromos = (Array.isArray(promotions) ? promotions : []).filter(p => 
      p.active && 
      (p.categories.includes(item.category) || p.items.includes(item.id))
    );
    return { ...item, activePromos };
  }).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)]"
    >
      {/* Menu Section */}
      <div className="lg:col-span-8 flex flex-col space-y-6 overflow-hidden">
        <DashboardHeader 
          title="Novo Pedido" 
          subtitle="Selecione os itens para a mesa." 
          onMenuToggle={onMenuToggle}
        />

        <div className="flex flex-col md:flex-row gap-4 items-center premium-card py-4">
          <div className="relative group flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-100 group-focus-within:text-gold transition-all" />
            <input 
              type="text" 
              placeholder="Buscar no cardápio..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-app border border-gold/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gold/50 outline-none transition-all w-full"
            />
          </div>
          
          {nicheConfig.features.rodizio && (
            <button 
              onClick={() => setIsRodizioActive(!isRodizioActive)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                isRodizioActive 
                  ? "bg-green-500/20 text-green-500 border-green-500/30" 
                  : "bg-gold/5 border-gold/10 opacity-60"
              )}
            >
              <Utensils size={14} />
              Rodízio {isRodizioActive ? 'Ativo' : 'Inativo'}
            </button>
          )}

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

        <div className="flex-grow overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gold/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMenu.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(item)}
                className="premium-card group flex flex-col text-left h-full"
              >
                <div className="relative h-32 -mx-6 -mt-6 mb-4 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/20">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-serif font-bold text-sm gold-text-gradient">{item.name}</h4>
                    {item.activePromos && item.activePromos.length > 0 && (
                      <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                        PROMO
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    {item.activePromos && item.activePromos.length > 0 ? (
                      <>
                        <span className="text-[10px] line-through opacity-30">R$ {item.price.toFixed(2)}</span>
                        <span className="text-gold font-bold text-sm">
                          R$ {(item.price * (1 - (item.activePromos[0].type === 'percentage' ? (item.activePromos[0].value || 0) / 100 : 0))).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gold font-bold text-sm">R$ {item.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="p-2 rounded-lg bg-gold/10 text-gold group-hover:bg-gold group-hover:text-premium-black transition-all">
                    <Plus size={16} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-4 flex flex-col h-full">
        <div className="premium-card flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif font-bold gold-text-gradient flex items-center gap-2">
              <ShoppingCart size={20} />
              Carrinho
            </h3>
            <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{cart.length} itens</span>
          </div>

          {/* Table Selection */}
          <div className="mb-6 space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Mesa</label>
            <div className="grid grid-cols-4 gap-2">
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={cn(
                    "py-2 rounded-lg text-xs font-bold transition-all border",
                    selectedTable === t.id 
                      ? "gold-gradient text-premium-black border-transparent shadow-lg" 
                      : t.status === 'livre' 
                        ? "bg-gold/5 border-gold/10 opacity-60 hover:opacity-100"
                        : "bg-red-500/10 border-red-500/20 text-red-500 opacity-40 cursor-not-allowed"
                  )}
                  disabled={t.status !== 'livre'}
                >
                  {t.number}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-6 scrollbar-thin scrollbar-thumb-gold/20">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                <Utensils size={48} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Carrinho Vazio</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-3 bg-gold/5 rounded-xl border border-gold/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-bold">{item.name}</h5>
                      <p className="text-[10px] text-gold font-bold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-app rounded-lg border border-gold/10 p-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-gold/10 rounded-md text-gold transition-all">-</button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-gold/10 rounded-md text-gold transition-all">+</button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Obs..." 
                      className="bg-transparent border-b border-gold/10 text-[10px] focus:border-gold outline-none transition-all w-24 px-1"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-gold/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-serif font-bold gold-text-gradient">R$ {total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleSendOrder}
              disabled={cart.length === 0 || !selectedTable}
              className="w-full gold-gradient text-premium-black py-4 rounded-xl font-bold shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100"
            >
              <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              Enviar para Cozinha
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

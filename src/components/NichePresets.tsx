import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Settings2, 
  ChevronRight, 
  CheckCircle2, 
  Pizza, 
  Beef as Burger, 
  Fish, 
  Coffee,
  Info,
  Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNicheStore, NICHE_CONFIGS, NicheType } from '../lib/store';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import DashboardHeader from './DashboardHeader';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NichePresets({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { niche: currentNiche, setNiche } = useNicheStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [niches, setNiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const startNicheWizard = async (nichoId: string) => {
    if (creating) return;
    
    console.log('Starting wizard for niche:', nichoId);
    setCreating(nichoId);
    
    try {
      const res = await fetch('/api/apps/create-from-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nicho: nichoId, 
          userId: user?.id || 'anonymous' 
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao criar app');
      }
      
      const { appId } = await res.json();
      console.log('App created successfully:', appId);
      toast.success('App gerado com sucesso! Iniciando assistente...');
      
      // Pequeno delay para garantir que o usuário veja o feedback
      setTimeout(() => {
        navigate(`/wizard/${appId}`);
      }, 500);
    } catch (error: any) {
      console.error('Error creating app:', error);
      toast.error(error.message || 'Falha ao gerar aplicativo automático');
    } finally {
      setCreating(null);
    }
  };

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        const data = await api.niches.getAll();
        console.log('Fetched niches:', data);
        setNiches(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching niches:', error);
        toast.error('Erro ao carregar nichos');
        setLoading(false);
      }
    };
    fetchNiches();
  }, []);

  const handleSelectNiche = (nicheId: string) => {
    setNiche(nicheId as any);
    toast.success(`Nicho alterado para: ${nicheId}`);
  };

  const getNicheIcon = (iconName: string) => {
    switch (iconName) {
      case 'Pizza': return <Pizza className="w-6 h-6" />;
      case 'Burger': return <Burger className="w-6 h-6" />;
      case 'Fish': return <Fish className="w-6 h-6" />;
      case 'Coffee': return <Coffee className="w-6 h-6" />;
      default: return <Settings2 className="w-6 h-6" />;
    }
  };

  const filteredNiches = niches.filter(n => 
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Presets de Nicho" 
        subtitle="Configure seu sistema com presets otimizados para seu tipo de negócio." 
        onMenuToggle={onMenuToggle}
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input 
            type="text" 
            placeholder="Buscar nichos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card-app border border-border-app rounded-xl focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-card-app border border-border-app rounded-3xl animate-pulse" />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredNiches.map((niche) => {
              const isActive = currentNiche === niche.id;
              return (
                <motion.div
                  key={niche.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "premium-card group relative overflow-hidden cursor-pointer transition-all duration-300",
                    isActive ? "border-gold ring-1 ring-gold/20" : "hover:border-gold/30"
                  )}
                  onClick={() => {
                    console.log('Card clicked for niche:', niche.id);
                    startNicheWizard(niche.id);
                  }}
                >
                  {creating === niche.id && (
                    <div className="absolute inset-0 bg-premium-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
                      <div className="text-center">
                        <p className="text-sm font-bold gold-text-gradient uppercase tracking-[0.3em] animate-pulse mb-1">Gerando App</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Aguarde um momento...</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "p-3 rounded-2xl transition-colors",
                      isActive ? "bg-gold text-premium-black shadow-lg shadow-gold/20" : "bg-white/5 text-gold group-hover:bg-gold/10"
                    )}>
                      {getNicheIcon(niche.icon)}
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" />
                        Ativo
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2 gold-text-gradient">{niche.name}</h3>
                  <p className="text-sm opacity-60 mb-6 line-clamp-2">{niche.description}</p>
                  
                  <div className="space-y-3 pt-6 border-t border-border-app">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <span>Módulos Inclusos</span>
                      <Info className="w-3 h-3" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {niche.config.modules.map((mod: string) => (
                        <span key={mod} className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium capitalize">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startNicheWizard(niche.id);
                      }}
                      className={cn(
                        "text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all",
                        isActive ? "bg-gold text-premium-black" : "bg-gold/10 text-gold hover:bg-gold hover:text-premium-black"
                      )}
                    >
                      {isActive ? 'Configurar Novamente' : 'Criar Este App'}
                    </button>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      isActive ? "bg-gold text-premium-black" : "bg-white/5 opacity-40 group-hover:opacity-100 group-hover:bg-gold/10 group-hover:text-gold"
                    )}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

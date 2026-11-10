import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  Layout,
  Type,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useThemeStore, ThemeToken } from '../lib/store';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import DashboardHeader from './DashboardHeader';
import { api } from '../services/api';

export default function Themes({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { theme, themeMode, accent, setThemeMode, setAccent } = useThemeStore();
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const data = await api.themes.getAll();
        setThemes(data);
        setLoading(false);
      } catch (error) {
        toast.error('Erro ao carregar temas');
        setLoading(false);
      }
    };
    fetchThemes();
  }, []);

  const handleSelectTheme = (themeId: ThemeToken) => {
    setAccent(themeId);
    toast.success(`Tema alterado para: ${themeId}`);
  };

  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    if (mode === 'system') {
      toast.success('Modo automático ativado: sincronizado com o sistema operacional.');
    } else {
      toast.success(mode === 'dark' ? 'Modo Escuro ativado.' : 'Modo Claro ativado.');
    }
  };

  const filteredThemes = themes.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Temas e Identidade" 
        subtitle="Personalize a aparência do seu sistema com cores e estilos exclusivos." 
        onMenuToggle={onMenuToggle}
      />

      <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
        <div className="flex flex-wrap items-center bg-card-app p-1 rounded-2xl border border-gold/10 gap-1">
          <button 
            onClick={() => handleThemeModeChange('light')}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              themeMode === 'light' ? "bg-gold text-premium-black shadow-lg" : "opacity-50 hover:opacity-100"
            )}
          >
            <Sun size={18} />
            Modo Claro
          </button>
          <button 
            onClick={() => handleThemeModeChange('dark')}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              themeMode === 'dark' ? "bg-gold text-premium-black shadow-lg" : "opacity-50 hover:opacity-100"
            )}
          >
            <Moon size={18} />
            Modo Escuro
          </button>
          <button 
            onClick={() => handleThemeModeChange('system')}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              themeMode === 'system' ? "bg-gold text-premium-black shadow-lg" : "opacity-50 hover:opacity-100"
            )}
            title="Detecta automaticamente o tema do sistema operacional (prefers-color-scheme)"
          >
            <Laptop size={18} />
            <span>Automático</span>
            {themeMode === 'system' && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/20 text-current">
                {theme === 'dark' ? 'SO: Escuro' : 'SO: Claro'}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input 
            type="text" 
            placeholder="Buscar temas..."
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
            {filteredThemes.map((t) => {
              const isActive = accent === t.id;
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "premium-card group relative overflow-hidden cursor-pointer transition-all duration-300",
                    isActive ? "border-gold ring-1 ring-gold/20" : "hover:border-gold/30"
                  )}
                  onClick={() => handleSelectTheme(t.id as ThemeToken)}
                >
                  {/* Preview Colors */}
                  <div className="flex gap-1 mb-6">
                    <div className="w-full h-12 rounded-lg" style={{ backgroundColor: t.colors.primary }} />
                    <div className="w-1/2 h-12 rounded-lg" style={{ backgroundColor: t.colors.secondary }} />
                    <div className="w-1/3 h-12 rounded-lg" style={{ backgroundColor: t.colors.accent }} />
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold gold-text-gradient">{t.name}</h3>
                    {isActive && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" />
                        Ativo
                      </div>
                    )}
                  </div>

                  <p className="text-sm opacity-60 mb-6 line-clamp-2">{t.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-app">
                    <div className="flex items-center gap-2 opacity-40">
                      <Layout size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Layout: {t.config.layout}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                      <Type size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Fonte: {t.config.fontFamily.split(',')[0]}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-xs font-bold gold-text-gradient opacity-0 group-hover:opacity-100 transition-opacity">
                      {isActive ? 'Tema Aplicado' : 'Aplicar Tema'}
                    </span>
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

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useNicheStore, NicheType } from '../lib/store';
import { toast } from 'sonner';
import DashboardHeader from './DashboardHeader';
import { NICHES } from '~/config/niches';

interface NicheItem {
  id: NicheType;
  title: string;
  icon: string;
  description: string;
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-950/80 border border-red-500/50 text-red-200 p-4 rounded-2xl flex items-center gap-3 mb-6 shadow-lg shadow-red-950/20"
    >
      <AlertCircle className="text-red-500 shrink-0 w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

export function NicheCard({ 
  nicheId, 
  title, 
  description, 
  icon, 
  isActive, 
  canChange, 
  remainingDays,
  onApply 
}: { 
  key?: React.Key;
  nicheId: NicheType; 
  title: string; 
  description: string; 
  icon: string; 
  isActive: boolean;
  canChange: boolean;
  remainingDays: number;
  onApply: (id: NicheType) => void;
}) {
  return (
    <div className="bg-[#0f0f0f] border border-[#d4af37]/30 hover:border-[#d4af37] rounded-2xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#d4af37]/10 transition-colors" />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label={title}>
              {icon}
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          </div>
          {isActive && (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle2 className="w-3. h-3" />
              Ativo
            </span>
          )}
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <div>
        {isActive ? (
          <div className="text-center py-2.5 px-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Nicho Ativo Atualmente
          </div>
        ) : canChange ? (
          <button
            onClick={() => onApply(nicheId)}
            className="w-full bg-[#d4af37] text-black font-bold py-3 px-4 rounded-xl hover:bg-[#e6c75f] active:scale-95 transition-all duration-200 shadow-lg shadow-[#d4af37]/10 text-sm uppercase tracking-wider"
          >
            Aplicar Nicho
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-zinc-500 text-xs font-medium">
            <Clock className="w-4 h-4 text-zinc-600 animate-pulse" />
            <span>Disponível em {remainingDays} {remainingDays === 1 ? 'dia' : 'dias'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NicheHub({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { setNiche, niche: clientNiche } = useNicheStore();
  const [activeNiche, setActiveNiche] = useState<NicheType>('default');
  const [lastChange, setLastChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [provisionStats, setProvisionStats] = useState<any | null>(null);

  const niches: NicheItem[] = NICHES as NicheItem[];

  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diff = now - lastChange;
  const canChange = !lastChange || diff >= THIRTY_DAYS;
  const remainingDays = Math.max(0, Math.ceil((THIRTY_DAYS - diff) / (1000 * 60 * 60 * 24)));

  const fetchActiveNiche = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.nicheHub.getActiveNiche();
      setActiveNiche(data.activeNiche as NicheType);
      setLastChange(data.lastNicheChange);
      
      // Keep store synchronized
      if (data.activeNiche) {
        setNiche(data.activeNiche as NicheType);
      }
    } catch (err: any) {
      console.error('Error fetching company niche info:', err);
      setError('Não foi possível carregar as informações do nicho da empresa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveNiche();
  }, []);

  const handleApplyNiche = async (nicheId: NicheType) => {
    if (submitting) return;
    
    setSubmitting(nicheId);
    setError(null);
    setProvisionStats(null);

    toast.promise(
      api.nicheHub.applyNiche(nicheId),
      {
        loading: 'Aplicando o novo nicho no sistema...',
        success: (data: any) => {
          setActiveNiche(data.activeNiche as NicheType);
          setLastChange(data.lastNicheChange);
          setNiche(data.activeNiche as NicheType);
          setProvisionStats(data.provisionInfo || null);
          setSubmitting(null);
          return `Nicho ${niches.find(n => n.id === nicheId)?.title} aplicado com sucesso!`;
        },
        error: (err: any) => {
          setSubmitting(null);
          const errMsg = err.error || err.message || 'Erro ao aplicar nicho.';
          setError(errMsg);
          return errMsg;
        }
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <DashboardHeader 
        title="Niche Hub" 
        subtitle="Mude o nicho operacional da sua empresa para desbloquear visualizações exclusivas." 
        onMenuToggle={onMenuToggle}
      />

      {provisionStats && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-zinc-950 border border-[#d4af37] rounded-3xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/5 rounded-full -mr-24 -mt-24 blur-3xl" />
          <h3 className="text-lg font-serif font-bold text-white mb-2 flex items-center gap-2">
            <CheckCircle2 className="text-[#d4af37] w-5 h-5" />
            Provisionamento Concluído com Sucesso!
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
            O motor de migração da Sistenfox ({activeNiche.toUpperCase()} Engine) configurou automaticamente o ecossistema para a sua empresa:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center">
              <span className="text-xs text-zinc-500 uppercase font-bold block">Produtos</span>
              <span className="text-2xl font-bold text-white">{provisionStats.productsCreated || 0}</span>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center">
              <span className="text-xs text-zinc-500 uppercase font-bold block">Serviços</span>
              <span className="text-2xl font-bold text-white">{provisionStats.servicesCreated || 0}</span>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center">
              <span className="text-xs text-zinc-500 uppercase font-bold block">Automações</span>
              <span className="text-2xl font-bold text-white">{provisionStats.automationsCreated || 0}</span>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center">
              <span className="text-xs text-zinc-500 uppercase font-bold block">Templates</span>
              <span className="text-2xl font-bold text-white">{provisionStats.templatesCreated || 0}</span>
            </div>
          </div>
        </motion.div>
      )}

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {niches.map((n) => {
            // Se o ícone for "restaurante", podemos usar "🍽️" como emoji
            const iconToRender = n.icon === 'restaurante' ? '🍽️' : n.icon;
            
            return (
              <NicheCard
                key={n.id}
                nicheId={n.id}
                title={n.title}
                description={n.description}
                icon={iconToRender}
                isActive={activeNiche === n.id}
                canChange={canChange}
                remainingDays={remainingDays}
                onApply={handleApplyNiche}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

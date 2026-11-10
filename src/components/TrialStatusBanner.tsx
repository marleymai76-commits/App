import { useState, useEffect } from 'react';
import { sfx_checkTrial, TrialStatus, sfx_resetTrial, sfx_expireTrialForTesting } from '../lib/trial';
import { Sparkles, Info, X, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function TrialStatusBanner() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus>(sfx_checkTrial());
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const update = () => {
      setTrialStatus(sfx_checkTrial());
    };
    update();
    window.addEventListener('sfx_trial_updated', update);
    return () => window.removeEventListener('sfx_trial_updated', update);
  }, [location.pathname]);

  // Don't show on public landing, login, register
  if (['/', '/login', '/register', '/sorteio'].includes(location.pathname)) {
    return null;
  }

  if (isDismissed) return null;

  if (trialStatus.isTrialExpired) {
    return (
      <div className="bg-gradient-to-r from-amber-950/70 via-zinc-950 to-amber-950/70 border-b border-[#ffb300]/30 px-4 py-2.5 text-xs text-white relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-300">
              Período de teste concluído: sua conta retornou ao <strong className="text-white">Plano Gratuito (Starter)</strong>. 
              <span className="text-emerald-400 font-semibold ml-1">O app continua funcionando normalmente!</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/#pricing"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#ffb300] hover:bg-[#e09e00] text-black font-extrabold text-[11px] transition-all shadow-md"
            >
              <Zap size={12} fill="currentColor" />
              Liberar Tudo com 70% OFF (2 Anos)
              <ArrowRight size={12} />
            </Link>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-zinc-500 hover:text-white p-1 transition-colors"
              title="Dispensar aviso"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Trial Banner (Top Plan Unlocked)
  return (
    <div className="bg-gradient-to-r from-cyan-950/60 via-zinc-950 to-cyan-950/60 border-b border-cyan-500/20 px-4 py-2 text-xs text-white relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400 w-3.5 h-3.5 animate-pulse shrink-0" />
          <span className="text-zinc-300">
            <strong>Teste Gratuito:</strong> Você está no <strong className="text-cyan-400">Plano Maior (Enterprise Fiscal)</strong> com todos os recursos liberados.
          </span>
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {trialStatus.diasRestantes} {trialStatus.diasRestantes === 1 ? 'dia restante' : 'dias restantes'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-zinc-400 hidden md:inline">
            Após 30 dias, a conta reverte ao plano gratuito contínuo.
          </span>
          <Link
            to="/#pricing"
            className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
          >
            Garantir 70% OFF por 2 anos
            <ArrowRight size={11} />
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-zinc-500 hover:text-white p-0.5"
            title="Dispensar aviso"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

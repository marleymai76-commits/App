import React from 'react';
import { Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StarterFeatureNoticeProps {
  featureName: string;
  requiredPlan?: string;
  description?: string;
}

export function StarterFeatureNotice({
  featureName,
  requiredPlan = 'Pocket Pro',
  description = 'Este recurso faz parte dos módulos avançados do ecossistema SISTENFOX.'
}: StarterFeatureNoticeProps) {
  return (
    <div className="p-8 my-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl mx-auto text-center shadow-xl">
      <div className="w-14 h-14 rounded-2xl bg-[#ffb300]/10 border border-[#ffb300]/30 text-[#ffb300] flex items-center justify-center mx-auto mb-4">
        <Lock size={24} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
        <CheckCircle2 size={12} />
        Sua conta está ativa no Plano Gratuito (Starter)
      </div>

      <h3 className="text-2xl font-serif font-bold text-white mb-2">
        {featureName} está disponível a partir do plano {requiredPlan}
      </h3>

      <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
        {description} O restante do seu aplicativo (Dashboard, Cardápio, Controle de Pedidos e Mesas) continua funcionando normalmente e sem interrupções!
      </p>

      <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 text-left max-w-md mx-auto mb-6 text-xs text-zinc-300 space-y-2">
        <div className="text-[11px] font-bold text-[#ffb300] uppercase tracking-wider mb-1">
          🔥 Oferta Exclusiva: 70% OFF por 2 Anos
        </div>
        <p>
          Assine hoje com <strong>70% de desconto garantido por 24 meses</strong> e libere {featureName}, Sistema Fiscal completo, relatórios detalhados e reservas online!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/#pricing"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#ffb300] hover:bg-[#e09e00] text-black font-extrabold text-xs transition-all shadow-lg shadow-[#ffb300]/10"
        >
          <Sparkles size={14} />
          Liberar Recurso com 70% OFF
          <ArrowRight size={14} />
        </Link>
        <Link
          to="/admin/dashboard"
          className="px-5 py-3 rounded-2xl border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold transition-all"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}

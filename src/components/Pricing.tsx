import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Crown, Sparkles, Tag } from 'lucide-react';
import { plans } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import TrialModal from './TrialModal';
import { trackEvent } from '../services/analytics';

export default function Pricing() {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [selectedPlanForTrial, setSelectedPlanForTrial] = useState<string>('');

  const handleCtaClick = (planName: string, price: number) => {
    setSelectedPlanForTrial(planName);
    trackEvent(
      'click_pricing_cta',
      'Pricing Page',
      `Botão Testar por 30 dias - Plano ${planName}`,
      price
    );
    setIsTrialModalOpen(true);
  };

  const handleFeatureClick = (planName: string, featureName: string) => {
    trackEvent(
      'click_pricing_feature',
      'Pricing Page',
      `Interação com Recurso: ${planName} - ${featureName}`
    );
  };

  const handleHeaderClick = () => {
    trackEvent(
      'click_pricing_header',
      'Pricing Page',
      'Cabeçalho de Preços e Planos'
    );
  };

  const plansArray = Object.values(plans).map(p => {
    let destaque = "Básico Gratuito";
    if (p.id === 'pocketPro') destaque = "Excelente Inicial";
    if (p.id === 'business') destaque = "Mais Vendido";
    if (p.id === 'enterprise') destaque = "Para Crescer";
    if (p.id === 'enterpriseFiscal') destaque = "Completo Fiscal";
    return {
      nome: p.name,
      preco: p.price,
      precoOriginal: (p as any).originalPrice,
      desconto: (p as any).discount,
      duracaoDesconto: (p as any).discountDuration,
      destaque,
      features: p.features,
      id: p.id
    };
  });

  return (
    <section id="pricing" className="py-28 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.03),transparent_60%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div 
          onClick={handleHeaderClick}
          className="text-center mb-20 cursor-pointer group select-none"
          title="Clique para enviar evento de teste"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Oferta Especial: 70% de Desconto Garantido por 2 Anos
          </div>

          <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 group-hover:text-cyan-300 transition-colors">
            Investimento
          </h2>
          <h3 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
            Planos com <span className="text-emerald-400">70% OFF</span> por 2 anos
          </h3>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto text-lg font-light">
            Aproveite a tarifa promocional travada por 24 meses (2 anos). Economize hoje no seu ecossistema SaaS completo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plansArray.map((plan, i) => (
            <motion.div
              key={plan.nome}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative flex flex-col p-6 rounded-3xl border transition-all duration-300",
                plan.id === 'business' 
                  ? "bg-gradient-to-br from-zinc-900 via-cyan-950/45 to-zinc-900 border-cyan-400 scale-105 z-10 shadow-[0_20px_50px_rgba(34,211,238,0.15)]" 
                  : "bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800 hover:border-cyan-400/30"
              )}
            >
              {plan.id === 'business' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-400 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                  <Crown className="w-3 h-3" /> Mais Popular
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center justify-between gap-1 mb-2">
                  <h4 className="text-lg font-bold text-white">{plan.nome}</h4>
                  {plan.desconto && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 tracking-wider">
                      <Tag className="w-2.5 h-2.5" />
                      {plan.desconto}
                    </span>
                  )}
                </div>

                {plan.precoOriginal && plan.precoOriginal > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-zinc-500 text-xs font-semibold line-through">
                        De R$ {plan.precoOriginal.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        -70%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-zinc-400 text-xs font-medium">Por R$</span>
                      <span className="text-3xl font-extrabold text-white">{plan.preco.toFixed(2).replace('.', ',')}</span>
                      <span className="text-zinc-400 text-xs">/mês</span>
                    </div>
                    <p className="mt-1.5 text-[10px] text-emerald-400 font-semibold">
                      ✓ Travado por 2 anos (24 meses)
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-zinc-500 text-xs font-medium">R$</span>
                      <span className="text-3xl font-extrabold text-white">{plan.preco.toFixed(2).replace('.', ',')}</span>
                      <span className="text-zinc-500 text-xs">/mês</span>
                    </div>
                    <p className="mt-1.5 text-[10px] text-zinc-400 font-medium">
                      Gratuito permanente
                    </p>
                  </div>
                )}

                <p className="mt-2 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">{plan.destaque}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li 
                    key={feature}
                    onClick={() => handleFeatureClick(plan.nome, feature)}
                    className="flex items-start gap-2.5 text-xs text-zinc-300 hover:text-cyan-300 cursor-pointer transition-colors group/feat select-none"
                    title={`Clique para interagir com o recurso: ${feature}`}
                  >
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 group-hover/feat:scale-125 transition-transform" />
                    <span className="group-hover/feat:underline decoration-cyan-400/30 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleCtaClick(plan.nome, plan.preco)}
                className={cn(
                  "w-full py-3 rounded-xl font-bold transition-all text-xs hover:scale-105 active:scale-95",
                  plan.id === 'business'
                    ? "bg-white text-black shadow-lg shadow-cyan-400/10 hover:bg-zinc-100"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {plan.preco === 0 ? "Começar Grátis" : "Testar por 30 dias"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <TrialModal isOpen={isTrialModalOpen} onClose={() => setIsTrialModalOpen(false)} />
    </section>
  );
}

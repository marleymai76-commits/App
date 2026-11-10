import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../lib/store';
import { safeFetch } from '../lib/utils';

export default function Pagamento() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('canceled') === 'true') {
      toast.error('Pagamento cancelado. Você pode tentar novamente quando quiser.');
      navigate('/pagamento', { replace: true });
    }
  }, [location, navigate]);

  const [selectedPlan, setSelectedPlan] = useState('business');

  const plans = [
    { id: 'pocketPro', name: 'Pocket Pro', price: 'R$ 20,70/mês', original: 'R$ 69,00', desc: 'Dashboard, controle de pedidos e cardápio digital' },
    { id: 'business', name: 'Business', price: 'R$ 29,70/mês', original: 'R$ 99,00', desc: 'Mais Vendido • Reservas, push e relatórios', featured: true },
    { id: 'enterprise', name: 'Enterprise', price: 'R$ 44,70/mês', original: 'R$ 149,00', desc: 'Alta performance, financeiro e estoque' },
    { id: 'enterpriseFiscal', name: 'Enterprise Fiscal', price: 'R$ 59,70/mês', original: 'R$ 199,00', desc: 'Plano Máximo • Sistema fiscal e pagamentos' }
  ];

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const email = user?.email || 'cliente@sistenfox.pt';
      const planItem = plans.find(p => p.id === selectedPlan) || plans[1];
      
      const result = await safeFetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          planName: `Plano ${planItem.name} (70% OFF)`,
        }),
      });

      const data = result.data;

      if (result.ok && data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(result.error || data?.error || 'Erro ao iniciar pagamento.');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Erro ao conectar com o provedor de pagamento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-black flex flex-col items-center justify-center p-4 relative">
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ChevronLeft size={20} />
        Voltar
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-app border border-gold/20 p-8 rounded-2xl max-w-lg w-full shadow-2xl shadow-gold/5 text-center"
      >
        <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard size={32} />
        </div>
        
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
          Promoção Oficial: 70% OFF por 2 Anos
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Assinatura SISTENFOX</h1>
        <p className="text-white/60 mb-6 text-xs">
          Preço promocional com 70% de desconto travado por 24 meses (2 anos).
        </p>

        {/* Seleção de Planos Unificada */}
        <div className="space-y-2.5 mb-6 text-left">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlan(p.id)}
              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                selectedPlan === p.id 
                  ? 'border-gold bg-gold/10 ring-1 ring-gold/20' 
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{p.name}</span>
                  {p.featured && (
                    <span className="text-[9px] font-extrabold uppercase bg-gold text-black px-1.5 py-0.5 rounded">
                      Popular
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{p.desc}</div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="text-[10px] text-zinc-500 line-through">De {p.original}</div>
                <div className="text-sm font-extrabold text-gold">{p.price}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-2 text-left mb-6 text-xs text-zinc-300 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Desconto de 70% garantido por 24 meses</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Suporte prioritário e atualizações incluídas</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Sem fidelidade: cancele quando quiser</span>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full gold-gradient text-premium-black font-extrabold py-3.5 px-4 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-gold/20 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processando Assinatura...
            </>
          ) : (
            'Assinar com 70% de Desconto'
          )}
        </button>
      </motion.div>
    </div>
  );
}

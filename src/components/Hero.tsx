import { useState } from 'react';
import { motion } from 'motion/react';
import TrialModal from './TrialModal';
import { trackEvent } from '../services/analytics';

export default function Hero() {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  const handleCtaClick = () => {
    trackEvent('click_hero_cta', 'Hero Section', 'Botão Testar por 30 dias - Hero');
    setIsTrialModalOpen(true);
  };

  const handleSecondaryClick = () => {
    trackEvent('click_hero_secondary', 'Hero Section', 'Botão Ver Recursos - Hero');
  };

  return (
    <section className="py-28 bg-gradient-to-br from-zinc-950 via-cyan-950 to-zinc-900 relative overflow-hidden flex items-center min-h-[85vh]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_50%)]" />
      
      <div className="max-w-5xl mx-auto px-6 text-center space-y-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="uppercase tracking-widest text-sm text-cyan-400 font-bold"
        >
          Desde 2018 • Lisboa • Soluções Premium para o seu Negócio
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none"
        >
          A Inteligência da Raposa <br />
          <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">No Seu Negócio Digital</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed"
        >
          O SISTENFOX é a solução modular e personalizável definitiva para gestão comercial, faturamento e experiência do cliente. O poder do físico integrado ao digital.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-4"
        >
          <button 
            onClick={handleCtaClick}
            className="w-full sm:w-auto px-16 py-8 bg-white text-black rounded-3xl font-semibold hover:scale-105 active:scale-95 transition-all text-2xl shadow-2xl shadow-cyan-400/10 flex items-center justify-center gap-3 group"
          >
            Testar por 30 dias
            <span className="text-3xl group-hover:rotate-12 transition">🦊</span>
          </button>

          <a 
            href="#features"
            onClick={handleSecondaryClick}
            className="w-full sm:w-auto px-12 py-7 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-3xl font-semibold hover:scale-105 active:scale-95 transition-all text-xl flex items-center justify-center gap-2"
          >
            Ver Recursos
          </a>
        </motion.div>

        {/* Métricas */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-zinc-900 max-w-4xl mx-auto"
        >
          <div>
            <div className="text-cyan-400 text-4xl md:text-5xl font-extrabold">500+</div>
            <div className="text-zinc-500 text-sm font-medium uppercase tracking-wider mt-1">Clientes Ativos</div>
          </div>
          <div>
            <div className="text-cyan-400 text-4xl md:text-5xl font-extrabold">1M+</div>
            <div className="text-zinc-500 text-sm font-medium uppercase tracking-wider mt-1">Pedidos/Mês</div>
          </div>
          <div>
            <div className="text-cyan-400 text-4xl md:text-5xl font-extrabold">50+</div>
            <div className="text-zinc-500 text-sm font-medium uppercase tracking-wider mt-1">Especialistas</div>
          </div>
          <div>
            <div className="text-cyan-400 text-4xl md:text-5xl font-extrabold">12+</div>
            <div className="text-zinc-500 text-sm font-medium uppercase tracking-wider mt-1">Países Atendidos</div>
          </div>
        </motion.div>
      </div>

      <TrialModal isOpen={isTrialModalOpen} onClose={() => setIsTrialModalOpen(false)} />
    </section>
  );
}

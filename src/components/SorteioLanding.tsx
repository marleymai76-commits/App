import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { VitalicioSorteioCard } from './VitalicioSorteioCard';
import { Link } from 'react-router-dom';
import { ChevronLeft, Sparkles, Trophy, ArrowRight, ShieldCheck, Star } from 'lucide-react';

interface Winner {
  id: string;
  email: string;
  plano: string;
  sorteadoEm: number;
}

function formatarDataInicio(inicio?: string | number | null): string {
  if (!inicio) return '01 de Julho de 2027';
  if (typeof inicio === 'number') {
    return new Date(inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  const parts = String(inicio).split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  return String(inicio);
}

export default function SorteioLanding() {
  const [config, setConfig] = useState({ 
    total: 10, 
    sorteados: 0, 
    ultimoSorteio: null as number | null,
    inicio: '2027-07-01',
    proximoSorteio: null as number | null 
  });
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSorteioPublicData = async () => {
      // 1. Try server-side public API first (reliable Admin SDK connection)
      try {
        const res = await fetch('/api/sorteio/public-data');
        if (res.ok) {
          const result = await res.json();
          if (isMounted && result) {
            if (result.config) setConfig(result.config);
            if (Array.isArray(result.winners)) setWinners(result.winners);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to client SDK if server route is unreachable
      }

      // 2. Fallback to client Firestore
      try {
        const configRef = doc(db, 'appConfig', 'sorteioVitalicio');
        const configSnap = await getDoc(configRef);
        if (isMounted && configSnap.exists()) {
          setConfig(configSnap.data() as any);
        }

        const winnersSnap = await getDocs(collection(db, 'sorteioVencedores'));
        const winnersList: Winner[] = [];
        winnersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          winnersList.push({
            id: docSnap.id,
            email: data.email || '',
            plano: data.plano || '',
            sorteadoEm: data.sorteadoEm || Date.now(),
          });
        });
        winnersList.sort((a, b) => b.sorteadoEm - a.sorteadoEm);
        if (isMounted) {
          setWinners(winnersList);
        }
      } catch (error: any) {
        console.warn('Aviso ao carregar dados do sorteio via Firestore client (usando dados de fallback):', error?.message || error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSorteioPublicData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[5%] w-[50%] h-[50%] bg-[#ffb300]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] left-[5%] w-[45%] h-[45%] bg-cyan-400/5 blur-[120px] rounded-full" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft size={16} className="text-[#ffb300]" />
          Voltar para Home
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Sorteio Ativo</span>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 flex-grow flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb300]/10 border border-[#ffb300]/20 text-[#ffb300] text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            Campanha Oficial SISTENFOX
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            🎁 Sorteio de <span className="text-[#ffb300] font-bold">10 Contas Vitalícias</span>
          </h1>

          <p className="text-sm md:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Início: <span className="text-[#ffb300] font-bold">{formatarDataInicio(config.inicio || config.proximoSorteio)}</span><br />
            1 conta sorteada por mês até completar as 10.
          </p>
        </motion.div>

        {/* Real-time configuration card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          {loading ? (
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-10 flex flex-col items-center justify-center text-zinc-500">
              <div className="w-8 h-8 border-2 border-t-[#ffb300] border-zinc-800 rounded-full animate-spin mb-3" />
              <span className="text-xs">Sincronizando estatísticas da campanha...</span>
            </div>
          ) : (
            <VitalicioSorteioCard 
              total={config.total} 
              sorteados={config.sorteados} 
              ultimoSorteio={config.ultimoSorteio} 
            />
          )}
        </motion.div>

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12 space-y-4"
        >
          <Link
            to="/saas"
            className="inline-flex items-center gap-2.5 bg-[#ffb300] hover:bg-[#e09e00] text-black px-8 py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-xl shadow-[#ffb300]/10 group"
          >
            Assinar Pocket Pro e Participar
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-zinc-500">
            Já é assinante? Faça login no seu painel e clique em <strong>Sorteio Vitalício</strong> no menu lateral para participar!
          </p>
        </motion.div>

        {/* Winners List Section */}
        {winners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-2xl mt-20 space-y-6"
          >
            <div className="flex items-center gap-3 justify-center">
              <div className="h-px bg-zinc-800 flex-grow" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#ffb300] flex items-center gap-1.5 shrink-0">
                <Trophy size={14} />
                Galeria de Vencedores
              </h3>
              <div className="h-px bg-zinc-800 flex-grow" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {winners.map((winner) => (
                <div key={winner.id} className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-2xl flex items-center justify-between gap-4">
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">{winner.email}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                      Plano: {winner.plano}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-1 bg-[#ffb300]/10 border border-[#ffb300]/20 text-[#ffb300] rounded-lg text-[10px] font-bold">
                      {new Date(winner.sorteadoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Information Grid / Trust Elements */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-3xl">
          <div className="p-6 bg-zinc-950/40 rounded-2xl border border-zinc-900">
            <Star className="text-[#ffb300] mb-3" size={20} />
            <h4 className="text-sm font-bold text-white mb-1">Sem Pegadinhas</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              O vencedor ganha isenção permanente de qualquer mensalidade ou taxa de manutenção no plano sorteado.
            </p>
          </div>
          <div className="p-6 bg-zinc-950/40 rounded-2xl border border-zinc-900">
            <ShieldCheck className="text-cyan-400 mb-3" size={20} />
            <h4 className="text-sm font-bold text-white mb-1">Sorteio Seguro</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Algoritmo de sorteio auditável e transparente executado de forma automática via Firebase Cloud Scheduler.
            </p>
          </div>
          <div className="p-6 bg-zinc-950/40 rounded-2xl border border-zinc-900">
            <Trophy className="text-[#ffb300] mb-3" size={20} />
            <h4 className="text-sm font-bold text-white mb-1">Chances Altas</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Exclusivo para assinantes premium elegíveis. Menos concorrentes significa chances incrivelmente reais de ganhar!
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 text-center text-[10px] text-zinc-600 border-t border-zinc-950 mt-12">
        © 2026 SISTENFOX • TODOS OS DIREITOS RESERVADOS • PLATAFORMA DE GESTÃO SAAS PREMIUM
      </footer>
    </div>
  );
}

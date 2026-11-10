import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Calendar, Ticket } from 'lucide-react';

interface VitalicioSorteioCardProps {
  total: number;
  sorteados: number;
  ultimoSorteio?: number | null;
}

export function VitalicioSorteioCard({ total = 10, sorteados = 3, ultimoSorteio }: VitalicioSorteioCardProps) {
  const restam = Math.max(0, total - sorteados);
  const progressoPorcentagem = total > 0 ? (sorteados / total) * 100 : 0;

  const formatarData = (timestamp?: number | null) => {
    if (!timestamp) return 'Nenhum sorteio realizado ainda';
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative bg-[#0d0d0d] border border-[#ffb300]/40 rounded-3xl p-8 text-white shadow-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Golden Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffb300]/10 to-transparent animate-shine pointer-events-none"></div>

      <style>
        {`
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shine {
            animation: shine 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}
      </style>

      {/* Decorative Blur elements */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ffb300]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 flex-grow">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffb300]/10 border border-[#ffb300]/30 text-[#ffb300] text-xs font-semibold tracking-wider uppercase">
            <Sparkles size={12} className="animate-pulse" />
            Campanha Vitalícia Premium
          </div>

          <h2 className="text-3xl font-serif font-bold tracking-tight text-white">
            Sorteio de <span className="text-[#ffb300] font-bold">10 Contas Vitalícias</span>
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
            Sua chance única de garantir acesso ilimitado para sempre ao ecossistema <strong>SISTENFOX</strong>. 1 conta sorteada de forma transparente por mês!
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider mb-1">Último Sorteio</span>
              <span className="text-xs text-zinc-300 font-medium flex items-center gap-1">
                <Calendar size={13} className="text-[#ffb300]" />
                {formatarData(ultimoSorteio)}
              </span>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider mb-1">Contas Restantes</span>
              <span className="text-sm text-white font-bold flex items-center gap-1">
                <Trophy size={14} className="text-cyan-400" />
                {restam} {restam === 1 ? 'disponível' : 'disponíveis'}
              </span>
            </div>
          </div>
        </div>

        {/* Circular indicator / Stats Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 min-w-[180px] shrink-0 text-center">
          <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Foreground Circle */}
              <motion.path
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${progressoPorcentagem}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-[#ffb300]"
                strokeWidth="2.5"
                strokeDasharray="0, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-serif font-bold text-white">{sorteados}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Sorteados</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-zinc-400">Total de Contas: <strong>{total}</strong></span>
            <div className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1 justify-center">
              <Ticket size={10} />
              Ativo no Sistema
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

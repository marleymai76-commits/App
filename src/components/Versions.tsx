import { motion } from 'motion/react';
import { restauranteApp } from '@/src/constants';

export default function Versions() {
  return (
    <section id="versions" className="py-28 bg-gradient-to-b from-black to-zinc-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 text-left">Versatilidade</h2>
            <h3 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white text-left">Um script, infinitas possibilidades</h3>
            <p className="mt-4 text-zinc-400 text-left text-lg font-light">
              O SISTENFOX é modular. Com poucos cliques você adapta toda a interface para o seu nicho específico.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 cursor-not-allowed select-none">←</div>
            <div className="w-12 h-12 rounded-full border border-cyan-400 flex items-center justify-center text-cyan-400 cursor-pointer hover:bg-cyan-400 hover:text-black transition-all">→</div>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
          {restauranteApp.versoes.map((versao, i) => (
            <motion.div
              key={versao}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="min-w-[280px] group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-4 border border-zinc-900 group-hover:border-cyan-400/30 transition-all duration-300">
                <img 
                  src={`https://picsum.photos/seed/${versao}/600/800`} 
                  alt={versao}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1 block">Nicho</span>
                  <h4 className="text-2xl font-bold text-white">{versao}</h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

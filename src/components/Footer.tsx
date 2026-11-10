import { Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { restauranteApp } from '@/src/constants';

export default function Footer() {
  return (
    <footer id="contact" className="bg-black pt-28 pb-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-400 rounded-2xl flex items-center justify-center text-black font-semibold text-lg">🦊</div>
              <span className="text-2xl font-bold text-white tracking-tighter">
                SISTENFOX
              </span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">
              Na Sistenfox combinamos a astúcia da raposa com a mais avançada tecnologia para entregar soluções que não apenas funcionam — elas encantam.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-cyan-400 hover:text-black transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-cyan-400 hover:text-black transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-cyan-400 hover:text-black transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Links Rápidos</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Funcionalidades</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Planos e Preços</a></li>
              <li><a href="/baixar-app" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">Baixar App Android (Offline)</a></li>
              <li><a href="#versions" className="hover:text-cyan-400 transition-colors">Demonstração</a></li>
              <li><a href="/login" className="hover:text-cyan-400 transition-colors">Área do Cliente</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Suporte</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Documentação API</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Contato</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-cyan-400" />
                hello@sistenfox.pt
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-cyan-400" />
                +351 928 332 154
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Lisboa, Portugal
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 text-center text-xs text-zinc-500 font-medium tracking-widest uppercase flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© 2026 SISTENFOX Lda. Todos os direitos reservados.</span>
          <span>Lisboa • Portugal</span>
        </div>
      </div>
    </footer>
  );
}

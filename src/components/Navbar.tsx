import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdminMaster } from '../utils/starterFreePlan';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, role, isSuperadmin } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Funcionalidades', href: '#features' },
    { name: 'Planos', href: '#pricing' },
    { name: 'App Android', href: '/baixar-app', isRoute: true, badge: 'Offline' },
    { name: 'Versões', href: '#versions' },
    { name: 'Contato', href: '#contact' },
  ];

  const isMaster = isAdminMaster(user?.email || null);
  const userRole = isMaster || isSuperadmin || role === 'admin' || role === 'superadmin' ? 'admin' : (role || 'client');
  const dashboardPath = user ? `/${userRole}` : '/login';

  const hasBanner = !['/sorteio', '/login', '/register', '/pagamento'].includes(location.pathname) && !location.pathname.includes('sorteio-vitalicio');

  return (
    <header className={`fixed ${hasBanner ? 'top-[88px] sm:top-[52px]' : 'top-0'} left-0 right-0 z-50 bg-black/80 backdrop-blur-md text-zinc-300 border-b border-zinc-900 transition-all h-20`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Esquerda: logo SISTENFOX */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-cyan-400 rounded-2xl flex items-center justify-center text-black font-semibold text-lg group-hover:rotate-12 transition-all">🦊</div>
          <span className="text-xl font-bold text-white tracking-widest">
            SISTENFOX
          </span>
        </Link>

        {/* Centro: Links de Navegação (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-bold uppercase">
                    {link.badge}
                  </span>
                )}
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </a>
            )
          ))}
        </nav>

        {/* Direita: Auth & Dashboard CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link 
                to={dashboardPath}
                className="px-6 py-2.5 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-400/20 text-cyan-400 rounded-2xl font-semibold text-sm transition-all"
              >
                Painel Geral
              </Link>
              <button
                onClick={() => logout()}
                className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-4 py-2"
              >
                Entrar
              </Link>
              <Link 
                to="/register"
                className="px-6 py-2.5 bg-white text-black hover:bg-cyan-400 hover:scale-105 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-cyan-400/5"
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>

        {/* Hamburguer Button (Mobile) */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Gaveta (Mobile Drawer) */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-black/95 px-6 py-8 space-y-6 flex flex-col">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-between"
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                    {link.badge}
                  </span>
                )}
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-zinc-300 hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </a>
            )
          ))}
          <div className="pt-6 border-t border-zinc-900 flex flex-col gap-4">
            {user ? (
              <>
                <Link 
                  to={dashboardPath}
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-6 py-3 bg-cyan-950/40 border border-cyan-400/20 text-cyan-400 rounded-2xl font-semibold transition-all"
                >
                  Painel Geral
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full text-center px-6 py-3 bg-red-950/20 text-red-400 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" /> Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-6 py-3 bg-zinc-900 text-zinc-300 rounded-2xl font-semibold"
                >
                  Entrar
                </Link>
                <Link 
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-6 py-3 bg-white text-black rounded-2xl font-semibold hover:bg-cyan-400 transition-colors"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

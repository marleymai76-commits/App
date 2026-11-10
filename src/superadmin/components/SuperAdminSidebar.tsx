import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  ShieldAlert, 
  LogOut, 
  Activity, 
  Home,
  Sparkles,
  Cpu,
  FileText,
  LayoutGrid,
  History
} from 'lucide-react';
import { FoxSignature, THEME } from '../../components/SistenfoxDS';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function SuperAdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Visão Geral', path: '/super-admin/overview', icon: LayoutDashboard },
    { name: 'Clientes SaaS', path: '/super-admin/clients', icon: Users },
    { name: 'Criar App Cliente', path: '/super-admin/autoapp', icon: Sparkles },
    { name: 'Instalações PWA', path: '/super-admin/deployments', icon: Monitor },
    { name: 'Usuários', path: '/super-admin/users', icon: ShieldAlert },
    { name: 'Auditoria & Logs', path: '/super-admin/audit', icon: History },
    { name: 'Diagnóstico & KPI', path: '/super-admin/diagnostics', icon: Activity },
  ];

  const aiMenuItems = [
    { name: 'Criar App com IA', path: '/super-admin/ai-assistant', icon: Cpu },
    { name: 'Estúdio de Conteúdo', path: '/super-admin/ai-assistant/content', icon: FileText },
    { name: 'Gerador de Dashboards', path: '/super-admin/ai-assistant/dashboard', icon: LayoutGrid },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sessão do Super Admin encerrada');
      navigate('/login');
    } catch (err) {
      toast.error('Erro ao encerrar sessão');
    }
  };

  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen fixed top-0 left-0 z-30">
      {/* Sidebar Header */}
      <div className="h-20 border-b border-zinc-900 flex items-center px-8 gap-3">
        <FoxSignature size="sm" />
        <div>
          <span className="text-white font-bold tracking-widest text-sm block">SISTENFOX</span>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">SUPER ADMIN</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 shadow-[0_4px_20px_rgba(34,211,238,0.05)]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.name}
            </NavLink>
          );
        })}

        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-4 pt-6 pb-2">
          Fox Neural Engine
        </div>

        {aiMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 shadow-[0_4px_20px_rgba(34,211,238,0.05)]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 space-y-4">
        {/* Ir para site principal */}
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <Home className="w-4 h-4" />
          Voltar ao App Principal
        </button>

        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">OPERADOR</span>
            <span className="text-xs text-zinc-300 truncate block font-light">
              {user?.email || 'admin@sistenfox.com'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
            title="Sair do Painel"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

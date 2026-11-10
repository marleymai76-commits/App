import React, { useState } from 'react';
import { Bell, Search, Filter, X, Check, Menu, BellRing, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useNotificationStore } from '../lib/store';
import { NativeNotificationService } from '../services/nativeNotification';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

import { isAdminMaster } from '../utils/starterFreePlan';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onMenuToggle?: () => void;
  children?: React.ReactNode;
}

export default function DashboardHeader({ title, subtitle, onMenuToggle, children }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAsRead, clearAll, nativePermission, requestNativePermission } = useNotificationStore();
  const { user: supabaseUser, role, isSuperadmin } = useAuth();

  const isMaster = isAdminMaster(supabaseUser?.email || null);
  const effectiveRole = isMaster || isSuperadmin || role === 'admin' || role === 'superadmin' ? 'admin' : (role || 'client');

  const user = supabaseUser ? {
    id: supabaseUser.uid,
    name: supabaseUser.displayName || supabaseUser.email?.split('@')[0] || 'Usuário',
    email: supabaseUser.email || '',
    role: effectiveRole
  } : null;

  const basePath = user ? `/${effectiveRole}` : '/admin';

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'waiter': return 'Garçom';
      case 'kitchen': return 'Cozinha';
      case 'cashier': return 'Caixa';
      case 'client': return 'Cliente';
      default: return 'Usuário';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Buscando por: ${searchQuery}`);
    }
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 pt-4 md:pt-0 px-5 md:px-0">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="md:hidden p-2.5 bg-card-app border border-gold/10 rounded-full text-gold active:scale-95 transition-all"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex-grow space-y-1">
          <h1 className="text-2xl md:text-2xl font-serif font-bold text-[#0F172A] dark:text-white dark:gold-text-gradient truncate">{title}</h1>
          <p className="text-slate-600 dark:text-zinc-400 text-xs md:text-sm font-medium tracking-wide truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        {children}
        <form onSubmit={handleSearch} className="relative flex-grow md:flex-grow-0 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 dark:text-gold/60 group-focus-within:text-[#0F172A] dark:group-focus-within:text-gold transition-all" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar..." 
            className="w-full md:w-56 bg-slate-50 dark:bg-card-app border border-[#E2E8F0] dark:border-gold/10 rounded-full pl-9 pr-9 py-2 text-xs text-[#0F172A] dark:text-white focus:border-[#0F172A] dark:focus:border-gold/50 focus:ring-1 focus:ring-[#0F172A] dark:focus:ring-gold/50 outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-gold/10 rounded-full text-slate-700 dark:text-gold transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </form>

        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2.5 rounded-full border border-[#E2E8F0] dark:border-gold/10 hover:bg-slate-100 dark:hover:bg-gold/10 transition-all relative active:scale-95 hover:scale-[1.02] shadow-sm text-[#0F172A] dark:text-gold",
            showFilters ? "bg-slate-200 dark:bg-gold/20 text-[#0F172A] dark:text-gold border-slate-400 dark:border-gold/30" : "bg-white dark:bg-card-app"
          )}
          title="Filtros Avançados"
        >
          <Filter className="w-4 h-4" />
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white dark:bg-card-app border border-[#E2E8F0] dark:border-gold/10 rounded-full hover:bg-slate-100 dark:hover:bg-gold/10 transition-all group active:scale-95 hover:scale-[1.02] text-[#0F172A] dark:text-gold shadow-sm"
          >
            <Bell className="w-4 h-4 text-slate-700 dark:text-gold" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 dark:bg-gold rounded-full border-2 border-white dark:border-card-app animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-card-app border border-gold/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-gold/5 flex justify-between items-center bg-gold/5">
                  <h3 className="font-serif font-bold gold-text-gradient">Notificações</h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAll}
                      className="text-[10px] uppercase font-bold text-gold hover:underline"
                    >
                      Limpar Tudo
                    </button>
                  )}
                </div>

                {/* Native Browser Notification Status Bar */}
                <div className="p-3 bg-zinc-900/60 border-b border-border-app text-xs">
                  {nativePermission === 'default' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <BellRing size={14} className="text-gold shrink-0 animate-bounce" />
                        <span className="font-medium">Alertas nativos do navegador</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight">
                        Seja avisado instantaneamente sobre novos agendamentos e pagamentos aprovados.
                      </p>
                      <button
                        onClick={async () => {
                          const granted = await requestNativePermission();
                          if (granted) {
                            toast.success("Notificações nativas autorizadas com sucesso!");
                            NativeNotificationService.notifyCriticalAlert({
                              title: "SISTENFOX Conectado! 🦊",
                              message: "Você agora receberá alertas nativos de agendamentos e pagamentos.",
                            });
                          } else {
                            toast.error("Permissão não concedida no navegador.");
                          }
                        }}
                        className="w-full mt-1 bg-gold hover:bg-[#e6c75f] text-black font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-gold/10"
                      >
                        <BellRing size={13} />
                        Ativar Alertas Nativos
                      </button>
                    </div>
                  ) : nativePermission === 'granted' ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                        Alertas nativos ativos
                      </div>
                      <button
                        onClick={() => {
                          NativeNotificationService.notifyPaymentApproved({
                            amount: 149.90,
                            method: "PIX",
                            client: "Cliente Demonstração",
                            description: "Assinatura Plano Premium"
                          });
                          toast.success("Notificação nativa de teste disparada!");
                        }}
                        className="text-[10px] uppercase tracking-wider font-bold text-gold hover:underline flex items-center gap-1"
                        title="Disparar notificação nativa de teste"
                      >
                        <Sparkles size={11} />
                        Testar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      Alertas nativos bloqueados no navegador.
                    </div>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center opacity-40 text-sm">
                      Nenhuma notificação por enquanto.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id}
                        className={cn(
                          "p-4 border-b border-gold/5 last:border-0 hover:bg-gold/5 transition-colors relative group",
                          !n.read && "bg-gold/5"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            n.type === 'success' ? "text-green-500" :
                            n.type === 'warning' ? "text-yellow-500" :
                            n.type === 'error' ? "text-red-500" : "text-blue-500"
                          )}>
                            {n.title}
                          </span>
                          {!n.read && (
                            <button 
                              onClick={() => markAsRead(n.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gold/10 rounded-full text-gold transition-all"
                              title="Marcar como lida"
                            >
                              <Check size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-xs opacity-70 mb-2">{n.message}</p>
                        <span className="text-[10px] opacity-30">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gold/10">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold gold-text-gradient">{user?.name || 'Usuário'}</p>
            <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{getRoleLabel(user?.role || '')}</p>
          </div>
          <Link 
            to={`${basePath}/profile`}
            className="w-10 h-10 rounded-full gold-gradient border border-gold/30 flex items-center justify-center font-bold text-premium-black shadow-lg shadow-gold/10 cursor-pointer hover:scale-105 transition-transform"
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Link>
        </div>
      </div>
    </header>
  );
}

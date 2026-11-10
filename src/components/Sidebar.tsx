import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Utensils, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  ShoppingCart,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Monitor,
  ChefHat,
  CreditCard,
  Table as TableIcon,
  TicketPercent,
  Settings2,
  Palette,
  X,
  ShieldCheck,
  Gift,
  Scissors,
  Stethoscope,
  Wrench,
  Package,
  HardHat,
  Wallet,
  Smartphone,
  Database
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuthStore, useNicheStore } from '../lib/store';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { FoxSignature } from './SistenfoxDS';
import { api } from '../services/api';

import { isAdminMaster } from '../utils/starterFreePlan';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout: storeLogout } = useAuthStore();
  const { user: supabaseUser, logout: supabaseLogout, role, isSuperadmin } = useAuth();
  const { niche } = useNicheStore();

  const isMaster = isAdminMaster(supabaseUser?.email || null);
  const effectiveRole = (isMaster || isSuperadmin || role === 'admin' || role === 'superadmin' ? 'admin' : (role || 'client')) as any;

  const user = supabaseUser ? {
    id: supabaseUser.uid,
    name: supabaseUser.displayName || supabaseUser.email?.split('@')[0] || 'Usuário',
    email: supabaseUser.email || '',
    role: effectiveRole
  } : null;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await supabaseLogout();
      storeLogout();
      toast.info('Você saiu do sistema.');
      navigate('/login');
    } catch (error) {
      storeLogout();
      navigate('/login');
    }
  };

  const basePath = user ? `/${user.role}` : '/dashboard';

  // Customize layout elements based on Niche
  const isRestaurantNiche = ['default', 'pizzaria', 'sushi', 'churrascaria', 'cafe', 'restaurante'].includes(niche);
  
  let menuLabel = 'Cardápio';
  let menuIcon = Utensils;
  if (niche === 'salao') {
    menuLabel = 'Serviços';
    menuIcon = Scissors;
  } else if (niche === 'clinica') {
    menuLabel = 'Consultas & Serviços';
    menuIcon = Stethoscope;
  } else if (niche === 'oficina') {
    menuLabel = 'Serviços & Peças';
    menuIcon = Wrench;
  } else if (niche === 'mercado' || niche === 'varejo') {
    menuLabel = 'Produtos & Estoque';
    menuIcon = Package;
  } else if (niche === 'construcao') {
    menuLabel = 'Insumos & Equipes';
    menuIcon = HardHat;
  }

  const reservationLabel = ['salao', 'clinica'].includes(niche) ? 'Agendamentos' : 'Reservas';
  const showReservations = ['default', 'pizzaria', 'sushi', 'churrascaria', 'cafe', 'restaurante', 'salao', 'clinica'].includes(niche);
  const showTables = isRestaurantNiche;
  const showWaiter = isRestaurantNiche;
  const showKitchen = isRestaurantNiche;
  const showCashier = isRestaurantNiche || niche === 'mercado' || niche === 'varejo';

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: basePath, roles: ['admin', 'manager', 'waiter', 'kitchen', 'cashier', 'client'], visible: true },
    { icon: Wallet, label: 'Minha Carteira', path: `${basePath}/wallet`, roles: ['admin', 'manager', 'waiter', 'kitchen', 'cashier', 'client', 'customer'], visible: true },
    { icon: TrendingUp, label: 'Relatórios', path: `${basePath}/reports`, roles: ['admin', 'manager'], visible: true },
    { icon: menuIcon, label: menuLabel, path: `${basePath}/menu`, roles: ['admin', 'manager', 'client'], visible: true },
    { icon: TicketPercent, label: 'Promoções', path: `${basePath}/promotions`, roles: ['admin', 'manager', 'waiter', 'client'], visible: true },
    { icon: TableIcon, label: 'Mesas', path: `${basePath}/tables`, roles: ['admin', 'manager', 'waiter', 'cashier'], visible: showTables },
    { icon: Palette, label: 'Temas', path: `${basePath}/themes`, roles: ['admin', 'manager', 'client'], visible: true },
    { icon: Gift, label: 'Sorteio Vitalício', path: `${basePath}/sorteio-vitalicio`, roles: ['admin', 'manager', 'waiter', 'kitchen', 'cashier', 'client'], visible: true },
    { icon: Settings2, label: 'Niche Hub', path: `${basePath}/niche-hub`, roles: ['admin'], visible: true },
    { icon: Monitor, label: 'Garçom', path: `${basePath}/waiter`, roles: ['admin', 'waiter'], visible: showWaiter },
    { icon: ChefHat, label: 'Cozinha', path: `${basePath}/kitchen`, roles: ['admin', 'kitchen'], visible: showKitchen },
    { icon: CreditCard, label: 'Caixa', path: `${basePath}/cashier`, roles: ['admin', 'cashier'], visible: showCashier },
    { icon: Calendar, label: reservationLabel, path: `${basePath}/reservations`, roles: ['admin', 'manager', 'waiter', 'client'], visible: showReservations },
    { icon: ShieldCheck, label: 'Qualidade do Sistema', path: `/global/quality`, roles: ['super_admin'], visible: true },
    { icon: Smartphone, label: 'App Android (Offline)', path: '/baixar-app', visible: true },
    { icon: Database, label: 'Backup & Cloud', path: `${basePath}/backup`, roles: ['admin', 'manager'], visible: true },
    { icon: Settings, label: 'Configurações', path: `${basePath}/settings`, roles: ['admin'], visible: true },
  ];

  const filteredItems = sidebarItems.filter(item => {
    if (!item.visible) return false;
    if (!item.roles) return true;
    if (isMaster || isSuperadmin) return true;
    if (effectiveRole === 'admin' && item.roles.includes('admin')) return true;
    return user && item.roles.includes(user.role);
  });

  const sidebarContent = (
    <aside 
      className={cn(
        "relative h-screen border-r border-zinc-800 flex flex-col bg-zinc-950 transition-all duration-300 z-40",
        isCollapsed ? "w-20" : "w-64",
        isOpen !== undefined && "w-64" // Mobile is always expanded
      )}
    >
      {/* Toggle Button (Desktop Only) */}
      {isOpen === undefined && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

      {/* Close Button (Mobile Only) */}
      {isOpen !== undefined && (
        <button 
          onClick={onClose}
          className="absolute right-4 top-6 p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-all"
        >
          <X size={20} />
        </button>
      )}

      <div className={cn("p-6 flex items-center gap-3", isCollapsed && "justify-center px-2")}>
        <FoxSignature size="sm" />
        {(!isCollapsed || isOpen !== undefined) && (
          <span className="text-xl font-bold text-white tracking-tighter truncate">
            SISTENFOX
          </span>
        )}
      </div>

      <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-3xl text-sm font-medium transition-all relative overflow-hidden",
                isActive 
                  ? "bg-white text-black border border-white" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-black" : "text-cyan-400")} />
              {(!isCollapsed || isOpen !== undefined) && <span>{item.label}</span>}
              {isActive && (!isCollapsed || isOpen !== undefined) && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all",
            isCollapsed && isOpen === undefined && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!isCollapsed || isOpen !== undefined) && <span>Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );

  if (isOpen !== undefined) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="hidden md:block">
      {sidebarContent}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Download,
  FileJson,
  FileSpreadsheet,
  ChevronRight,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DashboardStats } from './DashboardStats';
import { MonthlyRevenueChart } from './RevenueChart';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { cn } from '../lib/utils';
import AdminPanel from './AdminPanel';
import Reports from './Reports';
import Profile from './Profile';
import MenuManagement from './MenuManagement';
import TableManagement from './TableManagement';
import WaiterScreen from './WaiterScreen';
import KitchenScreen from './KitchenScreen';
import CashierScreen from './CashierScreen';
import Reservations from './Reservations';
import Promotions from './Promotions';
import Themes from './Themes';
import SorteioVitalicioPage from './SorteioVitalicioPage';
import NicheHub from './NicheHub';
import BackupManager from './BackupManager';
import { SalaoDashboard, ClinicaDashboard, OficinaDashboard, MercadoDashboard, ConstrucaoDashboard, VarejoDashboard } from './NicheDashboards';
import { toast } from 'sonner';
import { UserRole, usePromotionStore, useNicheStore } from '../lib/store';
import { useAuth } from '../context/AuthContext';
import BackButton from './BackButton';
import { StarterFeatureNotice } from './StarterFeatureNotice';
import { sfx_getUserEffectivePlan } from '../lib/trial';
import { checkPlan } from '../constants';
import { isAdminMaster } from '../utils/starterFreePlan';

const data = [
  { name: 'Seg', valor: 4000 },
  { name: 'Ter', valor: 3000 },
  { name: 'Qua', valor: 2000 },
  { name: 'Qui', valor: 2780 },
  { name: 'Sex', valor: 1890 },
  { name: 'Sáb', valor: 2390 },
  { name: 'Dom', valor: 3490 },
];

interface DashboardProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

function DashboardProtectedRoute({ children, allowedRoles }: DashboardProtectedRouteProps) {
  const { user, role, isSuperadmin } = useAuth();
  const isMaster = isAdminMaster(user?.email || null);
  const effectiveRole = (isMaster || isSuperadmin || role === 'admin' || role === 'superadmin' ? 'admin' : (role || 'client')) as UserRole;

  if (user && !allowedRoles.includes(effectiveRole) && effectiveRole !== 'admin') {
    return <Navigate to={`/${effectiveRole}`} replace />;
  }
  return <>{children}</>;
}

interface NicheProtectedRouteProps {
  children: React.ReactNode;
  allowedNiches: string[];
}

function NicheProtectedRoute({ children, allowedNiches }: NicheProtectedRouteProps) {
  const { niche } = useNicheStore();
  const { user: supabaseUser, role, isSuperadmin } = useAuth();
  const isMaster = isAdminMaster(supabaseUser?.email || null);
  const userRole = isMaster || isSuperadmin || role === 'admin' || role === 'superadmin' ? 'admin' : (role || 'client');

  if (!allowedNiches.includes(niche)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-[#0f0f0f] border border-[#d4af37]/20 rounded-3xl">
        <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Módulo Não Disponível</h2>
        <p className="text-zinc-400 text-sm max-w-md mb-6">
          Este módulo faz parte de outro segmento de negócio e não pertence ao seu nicho atual ({niche.toUpperCase()}). Mude o nicho no Niche Hub para desbloqueá-lo.
        </p>
        <Link 
          to={`/${userRole}`}
          className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#e6c75f] text-black font-bold rounded-full transition-all text-sm"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

interface PlanProtectedRouteProps {
  children: React.ReactNode;
  requiredPlan: string;
  featureName: string;
}

function PlanProtectedRoute({ children, requiredPlan, featureName }: PlanProtectedRouteProps) {
  const { user: supabaseUser } = useAuth();
  const effectivePlan = sfx_getUserEffectivePlan(supabaseUser as any);
  const isAllowed = checkPlan({ plan: effectivePlan }, requiredPlan);

  if (!isAllowed) {
    return (
      <StarterFeatureNotice 
        featureName={featureName} 
        requiredPlan={requiredPlan === 'business' ? 'Business' : requiredPlan === 'pocket' ? 'Pocket Pro' : 'Enterprise'}
        description={`O recurso "${featureName}" faz parte dos planos ${requiredPlan === 'business' ? 'Business' : 'Pocket Pro'} ou superior. Sua conta voltou ao Plano Gratuito (Starter) após os 30 dias no plano maior, mantendo o restante do app ativo.`}
      />
    );
  }

  return <>{children}</>;
}

function PromotionsBanner() {
  const { promotions } = usePromotionStore();
  const activePromos = (Array.isArray(promotions) ? promotions : []).filter(p => p.active);

  if (activePromos.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden premium-card bg-gradient-to-br from-zinc-900 via-cyan-950 to-zinc-900 p-0 mb-10"
    >
      <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-white">Ofertas Especiais Ativas</h2>
          <p className="text-sm text-zinc-300 font-medium">Aproveite nossos descontos exclusivos hoje!</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {activePromos.map(promo => (
            <div key={promo.id} className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 min-w-[200px]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-1">
                {promo.type.replace('_', ' ')}
              </div>
              <div className="font-bold text-white text-sm truncate">{promo.name}</div>
              <div className="text-xl font-bold text-white mt-1">
                {promo.type === 'percentage' ? `${promo.value}% OFF` : `R$ ${promo.value} OFF`}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full -mr-32 -mt-32 blur-3xl" />
    </motion.div>
  );
}

function DashboardHome({ onMenuToggle }: { onMenuToggle: () => void }) {
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('week');
  const { user: authUser, role, isSuperadmin } = useAuth();
  const { niche: activeNiche } = useNicheStore();
  
  const isMaster = isAdminMaster(authUser?.email || null);
  const effectiveRole = isMaster || isSuperadmin || role === 'admin' || role === 'superadmin' ? 'admin' : (role || 'client');
  const basePath = `/${effectiveRole}`;

  const user = authUser ? {
    id: authUser.uid,
    name: authUser.displayName || authUser.email?.split('@')[0] || 'Administrador',
    email: authUser.email || '',
    role: effectiveRole as UserRole
  } : null;

  const handleExport = (type: 'csv' | 'json') => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Exportando dados em ${type.toUpperCase()}...`,
        success: `Arquivo ${type.toUpperCase()} gerado com sucesso!`,
        error: 'Erro ao exportar arquivo.',
      }
    );
  };

  const getRoleLabel = (role?: UserRole) => {
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <DashboardHeader 
        title={`Bem-vindo, ${user?.name || getRoleLabel(user?.role)}`} 
        subtitle={
          activeNiche === 'salao' ? 'Aqui está o que está acontecendo no seu Salão de Beleza hoje.' :
          activeNiche === 'clinica' ? 'Aqui está o que está acontecendo no seu Consultório Clínico hoje.' :
          activeNiche === 'oficina' ? 'Aqui está o que está acontecendo na sua Oficina Mecânica hoje.' :
          activeNiche === 'mercado' ? 'Aqui está o que está acontecendo no seu Minimercado hoje.' :
          activeNiche === 'varejo' ? 'Aqui está o que está acontecendo na sua Loja de Varejo hoje.' :
          activeNiche === 'construcao' ? 'Aqui está o que está acontecendo na sua Obra de Construção hoje.' :
          'Aqui está o que está acontecendo no D-GUST-AI hoje.'
        } 
        onMenuToggle={onMenuToggle}
      />

      <PromotionsBanner />

      {activeNiche === "salao" && <SalaoDashboard />}
      {activeNiche === "clinica" && <ClinicaDashboard />}
      {activeNiche === "oficina" && <OficinaDashboard />}
      {activeNiche === "mercado" && <MercadoDashboard />}
      {activeNiche === "varejo" && <VarejoDashboard />}
      {activeNiche === "construcao" && <ConstrucaoDashboard />}

      {(activeNiche === "restaurante" || activeNiche === "default" || !["salao", "clinica", "oficina", "mercado", "varejo", "construcao"].includes(activeNiche)) && (
        <>
          {/* Date Filters */}
      <div className="flex items-center gap-2 p-1 bg-zinc-800 border border-zinc-700 rounded-3xl w-fit">
        {[
          { id: 'today', label: 'Hoje' },
          { id: 'week', label: 'Semana' },
          { id: 'month', label: 'Mês' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold transition-all",
              filter === btn.id 
                ? "bg-white text-black shadow-lg" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 via-cyan-950 to-zinc-900 p-8 rounded-3xl border border-zinc-800">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Desempenho Semanal</h2>
              <p className="text-xs text-zinc-400">Visão geral das vendas dos últimos 7 dias</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleExport('csv')}
                className="p-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-cyan-400 transition-all"
                title="Exportar CSV"
              >
                <FileSpreadsheet size={18} />
              </button>
              <button 
                onClick={() => handleExport('json')}
                className="p-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-cyan-400 transition-all"
                title="Exportar JSON"
              >
                <FileJson size={18} />
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#3f3f46',
                    borderRadius: '12px',
                    color: '#e4e4e7'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#22d3ee" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 text-white">Ações Rápidas</h2>
          <div className="space-y-4">
            {[
              { label: 'Novo Pedido', icon: ShoppingCart, color: 'bg-green-500' },
              { label: 'Reservar Mesa', icon: Users, color: 'bg-blue-500' },
              { label: 'Gerar Relatório', icon: FileSpreadsheet, color: 'bg-cyan-400' },
              { label: 'Configurações', icon: Settings, color: 'bg-purple-500', path: `${basePath}/settings` },
            ].map((action) => (
              <Link 
                key={action.label}
                to={action.path || '#'}
                className="w-full flex items-center justify-between p-4 rounded-3xl border border-zinc-800 hover:border-cyan-400/50 hover:bg-zinc-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-2xl text-white", action.color)}>
                    <action.icon size={18} />
                  </div>
                  <span className="font-medium text-sm text-zinc-300">{action.label}</span>
                </div>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all text-cyan-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="premium-card overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-serif font-bold gold-text-gradient">Pedidos Recentes</h2>
            <p className="text-xs opacity-40">Últimos 10 pedidos realizados hoje</p>
          </div>
          <button className="text-gold text-sm font-bold hover:underline flex items-center gap-1">
            Ver Todos <ChevronRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest opacity-30 border-b border-gold/10">
                <th className="pb-4 font-bold">ID Pedido</th>
                <th className="pb-4 font-bold">Cliente</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Valor</th>
                <th className="pb-4 font-bold">Data</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { id: '#SF-1024', client: 'Marcos Oliveira', status: 'Concluído', value: 'R$ 156,00', date: 'Hoje, 14:20' },
                { id: '#SF-1025', client: 'Ana Paula', status: 'Pendente', value: 'R$ 89,90', date: 'Hoje, 14:45' },
                { id: '#SF-1026', client: 'Ricardo Silva', status: 'Em Preparo', value: 'R$ 210,00', date: 'Hoje, 15:10' },
                { id: '#SF-1027', client: 'Juliana Costa', status: 'Concluído', value: 'R$ 45,00', date: 'Hoje, 15:30' },
              ].map((order) => (
                <tr key={order.id} className="border-b border-gold/5 last:border-0 hover:bg-gold/5 transition-colors">
                  <td className="py-5 font-medium">{order.id}</td>
                  <td className="py-5 opacity-70">{order.client}</td>
                  <td className="py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      order.status === 'Concluído' ? "bg-green-500/10 text-green-500" :
                      order.status === 'Pendente' ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-5 font-bold">{order.value}</td>
                  <td className="py-5 opacity-40">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true' && params.get('session_id')) {
      toast.success('Assinatura ativada com sucesso! Bem-vindo ao Sistenfox Premium.');
      // Remove query params from URL
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="flex h-screen bg-app text-app font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto mobile-safe-padding scroll-smooth p-4 md:p-8">
        <BackButton />
        <Routes>
          <Route index element={<DashboardHome onMenuToggle={() => setIsMobileMenuOpen(true)} />} />
          <Route path="dashboard" element={<DashboardHome onMenuToggle={() => setIsMobileMenuOpen(true)} />} />
          <Route 
            path="reports" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'manager']}>
                <PlanProtectedRoute requiredPlan="business" featureName="Relatórios Financeiros Avançados">
                  <Reports onMenuToggle={() => setIsMobileMenuOpen(true)} />
                </PlanProtectedRoute>
              </DashboardProtectedRoute>
            } 
          />
          <Route path="profile" element={<Profile onMenuToggle={() => setIsMobileMenuOpen(true)} />} />
          <Route 
            path="menu" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'manager', 'client']}>
                <MenuManagement onMenuToggle={() => setIsMobileMenuOpen(true)} />
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="tables" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'manager', 'waiter', 'cashier']}>
                <NicheProtectedRoute allowedNiches={['default', 'restaurante', 'pizzaria', 'sushi', 'churrascaria', 'cafe']}>
                  <TableManagement onMenuToggle={() => setIsMobileMenuOpen(true)} />
                </NicheProtectedRoute>
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="waiter" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'waiter']}>
                <NicheProtectedRoute allowedNiches={['default', 'restaurante', 'pizzaria', 'sushi', 'churrascaria', 'cafe']}>
                  <WaiterScreen onMenuToggle={() => setIsMobileMenuOpen(true)} />
                </NicheProtectedRoute>
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="kitchen" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'kitchen']}>
                <NicheProtectedRoute allowedNiches={['default', 'restaurante', 'pizzaria', 'sushi', 'churrascaria', 'cafe']}>
                  <KitchenScreen onMenuToggle={() => setIsMobileMenuOpen(true)} />
                </NicheProtectedRoute>
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="cashier" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'cashier']}>
                <NicheProtectedRoute allowedNiches={['default', 'restaurante', 'pizzaria', 'sushi', 'churrascaria', 'cafe', 'mercado', 'varejo']}>
                  <CashierScreen onMenuToggle={() => setIsMobileMenuOpen(true)} />
                </NicheProtectedRoute>
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="reservations" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'manager', 'waiter', 'client']}>
                <NicheProtectedRoute allowedNiches={['default', 'restaurante', 'pizzaria', 'sushi', 'churrascaria', 'cafe', 'salao', 'clinica']}>
                  <PlanProtectedRoute requiredPlan="business" featureName="Reservas & Agendamentos Online">
                    <Reservations onMenuToggle={() => setIsMobileMenuOpen(true)} />
                  </PlanProtectedRoute>
                </NicheProtectedRoute>
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="settings" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin']}>
                <AdminPanel onMenuToggle={() => setIsMobileMenuOpen(true)} />
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="promotions" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'manager', 'waiter', 'client']}>
                <Promotions onMenuToggle={() => setIsMobileMenuOpen(true)} />
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="themes" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'manager', 'client']}>
                <Themes onMenuToggle={() => setIsMobileMenuOpen(true)} />
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="sorteio-vitalicio" 
            element={
              <SorteioVitalicioPage onMenuToggle={() => setIsMobileMenuOpen(true)} />
            } 
          />
          <Route 
            path="niche-hub" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin']}>
                <NicheHub onMenuToggle={() => setIsMobileMenuOpen(true)} />
              </DashboardProtectedRoute>
            } 
          />
          <Route 
            path="backup" 
            element={
              <DashboardProtectedRoute allowedRoles={['admin', 'manager']}>
                <BackupManager onMenuToggle={() => setIsMobileMenuOpen(true)} />
              </DashboardProtectedRoute>
            } 
          />
          <Route path="*" element={<DashboardHome onMenuToggle={() => setIsMobileMenuOpen(true)} />} />
        </Routes>
      </main>
    </div>
  );
}

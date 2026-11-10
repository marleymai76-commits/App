import { motion, AnimatePresence } from 'motion/react';
import { Users, Shield, Activity, Settings, Search, MoreVertical, UserPlus, Palette, Layout, XCircle, ShieldCheck, Loader2, Database } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn, sanitizeInput } from '../lib/utils';
import { toast } from 'sonner';
import { useThemeStore, useNicheStore, ThemeToken, NicheType, UserRole } from '../lib/store';
import { api } from '../services/api';
import { autoDiagnoseApp, DiagnosticReport } from '../lib/diagnostics';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../context/AuthContext';
import BackupManager from './BackupManager';

export default function AdminPanel({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [activeTab, setActiveTab] = useState<'users' | 'customers' | 'permissions' | 'logs' | 'settings' | 'diagnostics' | 'backup'>('users');
  const { accent, setAccent } = useThemeStore();
  const { niche, setNiche } = useNicheStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const { companyId } = useAuth();
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'waiter' as UserRole
  });

  useEffect(() => {
    if (activeTab === 'users') {
      loadEmployees();
    } else if (activeTab === 'customers') {
      loadCustomers();
    }
  }, [activeTab]);

  const loadEmployees = async () => {
    try {
      const data = await api.admin.getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn('Erro ao carregar funcionários:', error);
      setEmployees([]);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await api.admin.getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn('Erro ao carregar clientes:', error);
      setCustomers([]);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sanitizedUser = {
        ...newUser,
        name: sanitizeInput(newUser.name),
        email: sanitizeInput(newUser.email),
        companyId: companyId || 'company_default'
      };

      if (activeTab === 'customers') {
        await api.admin.addCustomer(sanitizedUser);
        toast.success('Cliente cadastrado com sucesso!');
        setIsAddingUser(false);
        loadCustomers();
      } else {
        await api.admin.addEmployee(sanitizedUser);
        toast.success('Funcionário cadastrado com sucesso!');
        setIsAddingUser(false);
        loadEmployees();
      }
      setNewUser({ name: '', email: '', password: '', role: 'waiter' });
    } catch (error) {
      toast.error(activeTab === 'customers' ? 'Erro ao cadastrar cliente' : 'Erro ao cadastrar funcionário');
    }
  };

  const handleRunDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      const report = await autoDiagnoseApp();
      setDiagnosticReport(report);
      toast.success('Diagnóstico concluído!');
    } catch (error) {
      toast.error('Erro ao executar diagnóstico');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const themes: { id: ThemeToken; label: string; color: string }[] = [
    { id: 'sistenfox', label: 'Sistenfox Gold', color: '#FFD700' },
    { id: 'vermelho_gourmet', label: 'Vermelho Gourmet', color: '#EF4444' },
    { id: 'azul_premium', label: 'Azul Premium', color: '#3B82F6' },
    { id: 'verde_organico', label: 'Verde Orgânico', color: '#10B981' },
    { id: 'bronze_rustico', label: 'Bronze Rústico', color: '#CD7F32' },
    { id: 'prata_minimalista', label: 'Prata Minimalista', color: '#C0C0C0' },
  ];

  const niches: { id: NicheType; label: string; description: string }[] = [
    { id: 'default', label: 'Padrão', description: 'Configuração geral para restaurantes.' },
    { id: 'pizzaria', label: 'Pizzaria', description: 'Foco em massas, bordas e tamanhos.' },
    { id: 'sushi', label: 'Sushi Bar', description: 'Gestão de peças, combos e barca.' },
    { id: 'cafe', label: 'Cafeteria', description: 'Foco em micro-bebidas quentes.' },
    { id: 'churrascaria', label: 'Churrascaria', description: 'Gestão de cortes e rodízio.' },
  ];

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    waiter: 'Garçom',
    kitchen: 'Cozinha',
    cashier: 'Caixa',
    client: 'Cliente',
    staff: 'Funcionário',
    customer: 'Cliente',
    endCustomer: 'Cliente Final'
  };

  return (
    <div className="space-y-8 pb-20">
      <DashboardHeader 
        title="Painel Administrativo" 
        subtitle="Gerencie usuários, permissões e configurações globais." 
        onMenuToggle={onMenuToggle}
      >
        <button 
          onClick={() => setIsAddingUser(true)}
          className="bg-white text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
        >
          <UserPlus size={18} />
          {activeTab === 'customers' ? 'Novo Cliente' : 'Novo Funcionário'}
        </button>
      </DashboardHeader>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-zinc-900 rounded-full border border-zinc-800 w-fit">
        {[
          { id: 'users', label: 'Funcionários', icon: Users },
          { id: 'customers', label: 'Clientes', icon: Users },
          { id: 'permissions', label: 'Permissões', icon: Shield },
          { id: 'logs', label: 'Logs', icon: Activity },
          { id: 'settings', label: 'Configurações', icon: Settings },
          { id: 'diagnostics', label: 'Diagnóstico', icon: ShieldCheck },
          { id: 'backup', label: 'Backup & Cloud', icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-white text-black shadow-lg" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-100 group-focus-within:text-gold transition-all" />
          <input 
                type="text" 
                placeholder="Filtrar funcionários..." 
                className="bg-zinc-950 border border-zinc-700 rounded-full pl-10 pr-4 py-2 text-sm focus:border-cyan-400 outline-none transition-all w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest opacity-30 border-b border-zinc-700">
                  <th className="pb-4 font-bold">Usuário</th>
                  <th className="pb-4 font-bold">E-mail</th>
                  <th className="pb-4 font-bold">Cargo</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-zinc-800 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center font-bold text-black text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-medium text-white">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-5 text-zinc-400">{emp.email}</td>
                    <td className="py-5">
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                        {roleLabels[emp.role as UserRole] || emp.role}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", emp.status === 'Ativo' ? 'bg-green-500' : 'bg-red-500')} />
                        <span className="opacity-70">{emp.status || 'Ativo'}</span>
                      </div>
                    </td>
                    <td className="py-5 text-right">
                      <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'customers' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-100 group-focus-within:text-gold transition-all" />
              <input 
                type="text" 
                placeholder="Filtrar clientes..." 
                className="bg-zinc-950 border border-zinc-700 rounded-full pl-10 pr-4 py-2 text-sm focus:border-cyan-400 outline-none transition-all w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest opacity-30 border-b border-zinc-700">
                  <th className="pb-4 font-bold">Cliente</th>
                  <th className="pb-4 font-bold">E-mail</th>
                  <th className="pb-4 font-bold">Tipo</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {customers.map((cust) => (
                  <tr key={cust.uid || cust.id} className="border-b border-zinc-800 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center font-bold text-black text-xs">
                          {(cust.name || cust.email || 'C').charAt(0)}
                        </div>
                        <span className="font-medium text-white">{cust.name || 'Cliente'}</span>
                      </div>
                    </td>
                    <td className="py-5 text-zinc-400">{cust.email}</td>
                    <td className="py-5">
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                        Cliente
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="opacity-70">Ativo</span>
                      </div>
                    </td>
                    <td className="py-5 text-right">
                      <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      Nenhum cliente cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal Novo Funcionário / Cliente */}
      <AnimatePresence>
        {isAddingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-md bg-premium-black border border-border-app rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-border-app flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold gold-text-gradient">
                  {activeTab === 'customers' ? 'Novo Cliente' : 'Novo Funcionário'}
                </h2>
                <button onClick={() => setIsAddingUser(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-border-app rounded-xl focus:outline-none focus:border-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">E-mail</label>
                  <input 
                    required
                    type="email" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-3xl focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Senha Temporária</label>
                  <input 
                    required
                    type="password" 
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-3xl focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {activeTab !== 'customers' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Cargo / Função</label>
                    <select 
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-3xl focus:outline-none focus:border-cyan-400"
                    >
                      <option value="manager">Gerente</option>
                      <option value="waiter">Garçom</option>
                      <option value="kitchen">Cozinha</option>
                      <option value="cashier">Caixa</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t border-border-app">
                  <button 
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="px-6 py-3 rounded-xl font-bold opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-3 bg-white text-black font-bold rounded-3xl hover:scale-105 transition-all shadow-lg"
                  >
                    Cadastrar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeTab === 'permissions' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {['Admin', 'Gerente', 'Editor'].map((role) => (
            <div key={role} className="premium-card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif font-bold text-lg gold-text-gradient">{role}</h3>
                <Shield size={20} className="text-gold opacity-50" />
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Gerenciar Usuários', active: role === 'Admin' },
                  { label: 'Editar Conteúdo', active: true },
                  { label: 'Visualizar Relatórios', active: role !== 'Editor' },
                  { label: 'Configurações do Sistema', active: role === 'Admin' },
                ].map((perm) => (
                  <div key={perm.label} className="flex justify-between items-center">
                    <span className="text-sm opacity-70">{perm.label}</span>
                    <div className={cn(
                      "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                      perm.active ? "bg-gold" : "bg-gold/10"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-3 h-3 rounded-full bg-premium-black transition-all",
                        perm.active ? "right-1" : "left-1"
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'logs' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card"
        >
          <div className="space-y-6">
            {[
              { user: 'Marley Mai', action: 'Alterou configurações do sistema', time: 'Há 5 minutos' },
              { user: 'João Silva', action: 'Criou novo pedido #SF-1028', time: 'Há 12 minutos' },
              { user: 'Sistema', action: 'Backup diário concluído com sucesso', time: 'Há 1 hora' },
              { user: 'Maria Souza', action: 'Login realizado com sucesso', time: 'Há 2 horas' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-4 pb-6 border-b border-gold/5 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    <span className="text-gold">{log.user}</span> {log.action}
                  </p>
                  <p className="text-xs opacity-40 mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Theme Selector */}
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gold/10 rounded-lg text-gold">
                <Palette size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold gold-text-gradient">Temas Personalizados</h3>
                <p className="text-xs opacity-40">Escolha a cor de destaque do seu sistema.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setAccent(t.id);
                    toast.success(`Tema ${t.label} aplicado!`);
                  }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group",
                    accent === t.id 
                      ? "border-gold bg-gold/5" 
                      : "border-gold/10 hover:border-gold/30 bg-white/5"
                  )}
                >
                  <div 
                    className="w-10 h-10 rounded-full shadow-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Niche Presets */}
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gold/10 rounded-lg text-gold">
                <Layout size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold gold-text-gradient">Presets de Nicho</h3>
                <p className="text-xs opacity-40">Ajuste o sistema para o seu tipo de negócio.</p>
              </div>
            </div>

            <div className="space-y-4">
              {niches.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setNiche(n.id);
                    toast.success(`Preset ${n.label} ativado!`);
                  }}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all text-left group",
                    niche === n.id 
                      ? "border-gold bg-gold/5" 
                      : "border-gold/10 hover:border-gold/30 bg-white/5"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm gold-text-gradient">{n.label}</h4>
                      <p className="text-xs opacity-40 mt-1">{n.description}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      niche === n.id ? "border-gold bg-gold" : "border-gold/20"
                    )}>
                      {niche === n.id && <div className="w-2 h-2 rounded-full bg-premium-black" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'diagnostics' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="premium-card">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-serif font-bold gold-text-gradient">Auto-Engineer Diagnóstico</h3>
                <p className="text-sm opacity-40">Verifique a integridade do sistema e endpoints.</p>
              </div>
              <button 
                onClick={handleRunDiagnostics}
                disabled={isDiagnosing}
                className="gold-gradient text-premium-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
              >
                {isDiagnosing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                {isDiagnosing ? 'Executando...' : 'Iniciar Diagnóstico'}
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={async () => {
                    await fetch('/api/admin/audit', { method: 'POST' });
                    toast.success('Auditoria iniciada!');
                  }}
                  className="bg-gold/10 text-gold px-6 py-3 rounded-xl font-bold hover:bg-gold/20 transition-all"
                >
                  Executar Auditoria
                </button>
                <button 
                  onClick={async () => {
                    await fetch('/api/admin/test', { method: 'POST' });
                    toast.success('Testes iniciados!');
                  }}
                  className="bg-gold/10 text-gold px-6 py-3 rounded-xl font-bold hover:bg-gold/20 transition-all"
                >
                  Executar Testes
                </button>
              </div>
            </div>

            {diagnosticReport && (
              <div className="space-y-8">
                <div className="p-6 bg-gold/5 border border-gold/20 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">Resumo do Relatório</h4>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {diagnosticReport.summary}
                  </pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Validação de Endpoints</h4>
                    <div className="space-y-2">
                      {diagnosticReport.network.jsonValidation.map((test, i) => (
                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-gold/5 flex justify-between items-center">
                          <span className="text-xs font-mono opacity-60">{test.url}</span>
                          <span className="text-xs font-bold">{test.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Fluxos de Autenticação</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-white/5 rounded-lg border border-gold/5 flex justify-between items-center">
                        <span className="text-xs">Fluxo de Cadastro</span>
                        <span className={cn("text-xs font-bold", diagnosticReport.auth.registerFlow.ok ? "text-green-500" : "text-red-500")}>
                          {diagnosticReport.auth.registerFlow.ok ? "✔️ OK" : "❌ FALHA"}
                        </span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-gold/5 flex justify-between items-center">
                        <span className="text-xs">Fluxo de Login</span>
                        <span className={cn("text-xs font-bold", diagnosticReport.auth.loginFlow.ok ? "text-green-500" : "text-red-500")}>
                          {diagnosticReport.auth.loginFlow.ok ? "✔️ OK" : "❌ FALHA"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'backup' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BackupManager embedded />
        </motion.div>
      )}
    </div>
  );
}

import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Camera,
  Save,
  ChevronRight
} from 'lucide-react';
import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '../lib/store';

export default function Profile({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications'>('personal');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Salvando alterações...',
        success: () => {
          setIsSaving(false);
          return 'Perfil atualizado com sucesso!';
        },
        error: 'Erro ao salvar alterações.',
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <DashboardHeader 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações pessoais e configurações de segurança." 
        onMenuToggle={onMenuToggle}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'personal', label: 'Informações Pessoais', icon: User },
            { id: 'security', label: 'Segurança', icon: Lock },
            { id: 'notifications', label: 'Notificações', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-gold/10 text-gold border border-gold/20" 
                  : "opacity-60 hover:opacity-100 hover:bg-gold/5"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="premium-card">
            {activeTab === 'personal' && (
              <form onSubmit={handleSave} className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gold/5">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full gold-gradient p-1 shadow-2xl shadow-gold/20">
                      <div className="w-full h-full rounded-full bg-card-app flex items-center justify-center text-4xl font-serif font-bold gold-text-gradient">
                        {user?.name?.charAt(0) || 'A'}
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="absolute bottom-0 right-0 p-2 bg-gold text-premium-black rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-serif font-bold gold-text-gradient">{user?.name || 'Administrador'}</h3>
                    <p className="text-sm opacity-40 mb-4">{user?.email || 'admin@sistenfox.pt'}</p>
                    <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/20">
                      Plano Premium
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold opacity-50" />
                      <input 
                        type="text" 
                        defaultValue={user?.name || 'Administrador'}
                        className="w-full bg-gold/5 border border-gold/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold opacity-50" />
                      <input 
                        type="email" 
                        defaultValue={user?.email || 'admin@sistenfox.pt'}
                        className="w-full bg-gold/5 border border-gold/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 gold-gradient text-premium-black rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="pb-6 border-b border-gold/5">
                  <h3 className="text-lg font-serif font-bold gold-text-gradient mb-2">Alterar Senha</h3>
                  <p className="text-sm opacity-40">Garanta a segurança da sua conta com uma senha forte.</p>
                </div>

                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Senha Atual</label>
                    <input 
                      type="password" 
                      className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Nova Senha</label>
                    <input 
                      type="password" 
                      className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40">Confirmar Nova Senha</label>
                    <input 
                      type="password" 
                      className="w-full bg-gold/5 border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                    />
                  </div>
                  <button className="w-full py-3 border border-gold/20 text-gold rounded-xl font-bold hover:bg-gold/5 transition-all">
                    Atualizar Senha
                  </button>
                </div>

                <div className="pt-8 border-t border-gold/5">
                  <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-red-500 mb-1">Autenticação em Duas Etapas</h4>
                      <p className="text-xs opacity-40">Adicione uma camada extra de segurança à sua conta.</p>
                    </div>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">
                      Ativar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div className="pb-6 border-b border-gold/5">
                  <h3 className="text-lg font-serif font-bold gold-text-gradient mb-2">Preferências de Notificação</h3>
                  <p className="text-sm opacity-40">Escolha como e quando você quer ser notificado.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Novos Pedidos', desc: 'Receba alertas quando um novo pedido for realizado.', type: 'Push' },
                    { title: 'Relatórios Semanais', desc: 'Receba um resumo do desempenho por e-mail.', type: 'E-mail' },
                    { title: 'Alertas de Estoque', desc: 'Notifique quando itens estiverem acabando.', type: 'Push' },
                    { title: 'Atualizações do Sistema', desc: 'Fique por dentro de novas funcionalidades.', type: 'E-mail' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gold/5 border border-gold/10 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs opacity-40">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase font-bold opacity-30">{item.type}</span>
                        <div className="w-12 h-6 bg-gold rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-premium-black rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

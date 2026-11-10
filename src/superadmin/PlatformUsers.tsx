import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/SistenfoxDS';
import { 
  Shield, 
  Search, 
  Plus, 
  XCircle, 
  Mail, 
  Lock, 
  UserCheck, 
  UserPlus, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformUser {
  uid: string;
  email: string;
  role: string;
  tenant: string;
  createdAt: number;
}

export default function PlatformUsers() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('manager');
  const [tenant, setTenant] = useState('global');

  const roles = [
    { id: 'admin', label: 'Administrador (Admin)' },
    { id: 'super_admin', label: 'Super Admin Plataforma' },
    { id: 'manager', label: 'Gerente Comercial (Manager)' },
    { id: 'waiter', label: 'Garçom / Atendente (Waiter)' },
    { id: 'kitchen', label: 'Operador de Cozinha (Kitchen)' },
    { id: 'cashier', label: 'Operador de Caixa (Cashier)' },
  ];

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/admin/users', {
        headers: { 'x-user-uid': '0wRwjIHf5V1...' }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        toast.error('Erro ao listar usuários da plataforma');
      }
    } catch (err) {
      toast.error('Falha na conexão com o banco de autenticação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !email || !role) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': '0wRwjIHf5V1...'
        },
        body: JSON.stringify({ uid, email, role, tenant })
      });

      if (res.ok) {
        toast.success('Usuário e role cadastrados com sucesso!');
        setIsModalOpen(false);
        loadUsers();
        // Clear form
        setUid('');
        setEmail('');
        setRole('manager');
        setTenant('global');
      } else {
        toast.error('Erro ao vincular role ao usuário');
      }
    } catch (err) {
      toast.error('Erro ao conectar com servidor de autenticação');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase()) ||
    u.tenant?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-2">
            ROLE & PERMISSION ENGINE
          </h2>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Controle de Acesso de Usuários
          </h1>
        </div>
        <Button variant="neon" size="md" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Cadastrar Permissão / Usuário
        </Button>
      </div>

      {/* Main card list */}
      <Card className="bg-zinc-950 border border-zinc-900 overflow-hidden">
        <div className="p-6 border-b border-zinc-900 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-950/40">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por e-mail, role ou tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-sm pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:border-cyan-400/50 transition-all font-light"
            />
          </div>
          <Badge variant="cyan">{filteredUsers.length} Perfis mapeados</Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-light">
            Nenhum usuário mapeado para o critério informado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-950/20">
                  <th className="px-6 py-4">Usuário / ID Autenticação</th>
                  <th className="px-6 py-4">Cargo / Função (Role)</th>
                  <th className="px-6 py-4">Inquilino (Tenant)</th>
                  <th className="px-6 py-4">Data de Criação</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{user.email}</span>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-wider">UID: {user.uid}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${user.role === 'super_admin' ? 'text-rose-400' : 'text-cyan-400'}`} />
                        <span className="font-semibold text-xs uppercase tracking-wider">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                      {user.tenant === 'global' ? (
                        <Badge variant="cyan">GLOBAL</Badge>
                      ) : (
                        <span>{user.tenant}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs font-light">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                        <UserCheck className="w-3.5 h-3.5" /> Vinculado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal - Cadastrar Permissão */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">Vincular Role de Usuário</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  E-mail do Usuário
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    required
                    type="email"
                    placeholder="email@sistenfox.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  ID do Usuário (UID do Firebase Auth)
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    required
                    type="text"
                    placeholder="Cole o UID do console ou banco"
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Cargo / Nível de Acesso
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Escopo / Inquilino (Tenant)
                  </label>
                  <input
                    type="text"
                    placeholder="global ou ID do inquilino"
                    value={tenant}
                    onChange={(e) => setTenant(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-zinc-900">
                <Button 
                  variant="secondary" 
                  size="md" 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="neon" 
                  size="md" 
                  type="submit" 
                  disabled={submitting}
                  className="min-w-32"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Cadastrar'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

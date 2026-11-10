import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '../components/SistenfoxDS';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  clientId: string;
  name: string;
  ownerEmail: string;
  plan: string;
  status: string;
  appsDownloaded: number;
  createdAt: number;
  tenant: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [name, setName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [plan, setPlan] = useState('pro');
  const [status, setStatus] = useState('active');

  const plans = [
    { id: 'pocket', label: 'Pocket Pro (70% OFF: R$ 20,70/mês por 2 anos)' },
    { id: 'pro', label: 'Business (70% OFF: R$ 29,70/mês por 2 anos)' },
    { id: 'premium', label: 'Enterprise (70% OFF: R$ 44,70/mês por 2 anos)' },
    { id: 'fiscal', label: 'Enterprise Fiscal (70% OFF: R$ 59,70/mês por 2 anos)' }
  ];

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/admin/clients', {
        headers: { 'x-user-uid': '0wRwjIHf5V1...' }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      } else {
        toast.error('Erro ao buscar inquilinos SaaS');
      }
    } catch (err) {
      toast.error('Falha na comunicação com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleOpenCreate = () => {
    setFormMode('create');
    setName('');
    setOwnerEmail('');
    setPlan('pro');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setFormMode('edit');
    setSelectedClientId(client.clientId);
    setName(client.name);
    setOwnerEmail(client.ownerEmail);
    setPlan(client.plan || 'pro');
    setStatus(client.status || 'active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerEmail) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      if (formMode === 'create') {
        const res = await fetch('/admin/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-uid': '0wRwjIHf5V1...'
          },
          body: JSON.stringify({ name, ownerEmail, plan })
        });
        if (res.ok) {
          toast.success('Inquilino cadastrado com sucesso!');
          setIsModalOpen(false);
          loadClients();
        } else {
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.error || 'Erro ao cadastrar inquilino');
        }
      } else {
        const res = await fetch(`/admin/clients/${selectedClientId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-uid': '0wRwjIHf5V1...'
          },
          body: JSON.stringify({ name, ownerEmail, plan, status })
        });
        if (res.ok) {
          toast.success('Inquilino atualizado com sucesso!');
          setIsModalOpen(false);
          loadClients();
        } else {
          toast.error('Erro ao atualizar inquilino');
        }
      }
    } catch (err) {
      toast.error('Falha na requisição');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente este inquilino SaaS?')) {
      return;
    }

    try {
      const res = await fetch(`/admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: { 'x-user-uid': '0wRwjIHf5V1...' }
      });
      if (res.ok) {
        toast.success('Inquilino SaaS excluído com sucesso');
        loadClients();
      } else {
        toast.error('Falha ao excluir inquilino');
      }
    } catch (err) {
      toast.error('Erro ao comunicar exclusão');
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.ownerEmail?.toLowerCase().includes(search.toLowerCase()) ||
    c.clientId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-2">
            GESTÃO MULTI-TENANT
          </h2>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Clientes SaaS Ativos
          </h1>
        </div>
        <Button variant="neon" size="md" onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-5 h-5" /> Novo Inquilino
        </Button>
      </div>

      {/* Filter and Table area */}
      <Card className="bg-zinc-950 border border-zinc-900 overflow-hidden">
        <div className="p-6 border-b border-zinc-900 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-950/40">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text"
              placeholder="Buscar inquilino por nome, e-mail ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-sm pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:border-cyan-400/50 transition-all font-light"
            />
          </div>
          <Badge variant="cyan">{filteredClients.length} Inquilinos listados</Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-light">
            Nenhum inquilino SaaS encontrado para a busca especificada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-950/20">
                  <th className="px-6 py-4">Inquilino / ID</th>
                  <th className="px-6 py-4">Email do Dono</th>
                  <th className="px-6 py-4">Plano Ativo</th>
                  <th className="px-6 py-4">Dispositivos PWA</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-sm">
                {filteredClients.map((client) => (
                  <tr key={client.clientId} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                          ID: {client.clientId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-light">{client.ownerEmail}</td>
                    <td className="px-6 py-4 text-zinc-300">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold uppercase text-xs">{client.plan}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                      {client.appsDownloaded || 0} instalados
                    </td>
                    <td className="px-6 py-4">
                      {client.status === 'active' || !client.status ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-semibold">Ativo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-400">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-semibold">Suspenso</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
                          title="Editar Inquilino"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.clientId)}
                          className="p-2 bg-zinc-900/50 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 rounded-xl transition-colors"
                          title="Excluir Inquilino"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal - Cadastrar/Editar Inquilino */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {formMode === 'create' ? 'Novo Inquilino SaaS' : 'Editar Inquilino'}
              </h2>
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
                  Nome do Negócio
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Pizzaria Forno Nobre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  E-mail do Proprietário
                </label>
                <input
                  required
                  type="email"
                  placeholder="dono@pizzaria.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                  disabled={formMode === 'edit'}
                />
                {formMode === 'edit' && (
                  <p className="text-[10px] text-zinc-600 font-light">O e-mail do proprietário é imutável</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Plano de Assinatura
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {formMode === 'edit' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Status da Assinatura
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                    >
                      <option value="active">Ativo / Regular</option>
                      <option value="suspended">Suspenso / Bloqueado</option>
                    </select>
                  </div>
                )}
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
                  ) : formMode === 'create' ? (
                    'Cadastrar'
                  ) : (
                    'Salvar Alterações'
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

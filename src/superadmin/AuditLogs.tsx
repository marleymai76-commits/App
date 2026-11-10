import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  FirestoreError
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../lib/firebaseClient';
import { 
  Filter, 
  User, 
  Calendar, 
  Download, 
  Activity, 
  RefreshCw, 
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogIn,
  LogOut,
  ShieldAlert,
  ArrowUpCircle,
  Grid
} from 'lucide-react';
import { toast } from 'sonner';

// enum for audit logs matching instructions
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = getAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error in AuditLogs component: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuditLog {
  id: string;
  uid: string;
  action: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [searchUser, setSearchUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sintonizar logs em tempo real (Real-time logs)
  useEffect(() => {
    const logsPath = 'auditLogs';
    const q = query(
      collection(db, logsPath),
      orderBy('timestamp', 'desc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs: AuditLog[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedLogs.push({
          id: doc.id,
          uid: data.uid || '',
          action: data.action || '',
          timestamp: data.timestamp || 0,
          metadata: data.metadata || {}
        });
      });
      setLogs(fetchedLogs);
      setLoading(false);
    }, (error: FirestoreError) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, logsPath);
    });

    return () => unsubscribe();
  }, []);

  // Filter actions options
  const uniqueActions = ['all', ...Array.from(new Set(logs.map(log => log.action)))];

  // Filtragem dos logs
  const filteredLogs = logs.filter(log => {
    // Filtro por Ação
    if (filterAction !== 'all' && log.action !== filterAction) return false;

    // Filtro por Usuário (ID ou e-mail nos metadados)
    if (searchUser) {
      const matchUid = log.uid.toLowerCase().includes(searchUser.toLowerCase());
      const matchEmail = log.metadata?.email?.toLowerCase().includes(searchUser.toLowerCase());
      if (!matchUid && !matchEmail) return false;
    }

    // Filtro por Data Inicial
    if (startDate) {
      const startMs = new Date(startDate).getTime();
      if (log.timestamp < startMs) return false;
    }

    // Filtro por Data Final (estendemos até o fim do dia)
    if (endDate) {
      const endMs = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1);
      if (log.timestamp > endMs) return false;
    }

    return true;
  });

  // Exportar para CSV
  const exportToCSV = () => {
    try {
      if (filteredLogs.length === 0) {
        toast.error("Nenhum log filtrado para exportar.");
        return;
      }

      const headers = ['ID', 'User UID', 'E-mail', 'Ação', 'Data/Hora', 'Metadados Extra'];
      const csvRows = [headers.join(';')];

      for (const log of filteredLogs) {
        const dateStr = new Date(log.timestamp).toLocaleString('pt-BR');
        const extraData = log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : '';
        const row = [
          log.id,
          log.uid,
          log.metadata?.email || 'N/A',
          log.action,
          dateStr,
          `"${extraData}"`
        ];
        csvRows.push(row.join(';'));
      }

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `auditoria_sistenfox_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Logs exportados com sucesso!");
    } catch (e) {
      console.error("Erro ao exportar CSV:", e);
      toast.error("Falha ao exportar CSV.");
    }
  };

  // Ícone de acordo com o tipo de ação do log
  const getActionIcon = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('login')) return <LogIn className="w-4 h-4 text-emerald-400" />;
    if (a.includes('logout')) return <LogOut className="w-4 h-4 text-zinc-400" />;
    if (a.includes('lockout') || a.includes('block')) return <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />;
    if (a.includes('reactiv')) return <CheckCircle className="w-4 h-4 text-cyan-400" />;
    if (a.includes('change_plan') || a.includes('upgrade')) return <ArrowUpCircle className="w-4 h-4 text-yellow-400" />;
    if (a.includes('niche')) return <Grid className="w-4 h-4 text-purple-400" />;
    return <Activity className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-2">
            Rastreabilidade, Segurança & Auditoria
          </h2>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            🎯 Auditoria de Contas & Logs
          </h1>
        </div>

        <button 
          onClick={exportToCSV}
          disabled={loading || filteredLogs.length === 0}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-sm"
        >
          <Download className="w-4 h-4" /> Exportar Filtrados (CSV)
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-950 p-6 rounded-3xl border border-zinc-900 shadow-xl">
        {/* Busca por Usuário */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Buscar Usuário
          </label>
          <input 
            type="text" 
            placeholder="UID ou E-mail..." 
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-400 outline-none transition-colors text-white"
          />
        </div>

        {/* Filtrar Ação */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filtrar por Ação
          </label>
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-400 outline-none transition-colors text-white"
          >
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action === 'all' ? 'Todas as Ações' : action}
              </option>
            ))}
          </select>
        </div>

        {/* Data Inicial */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> De (Data Inicial)
          </label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-400 outline-none transition-colors text-white"
          />
        </div>

        {/* Data Final */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Até (Data Final)
          </label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-400 outline-none transition-colors text-white"
          />
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="bg-zinc-950 rounded-3xl border border-zinc-900 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            <h3 className="text-md font-bold tracking-tight text-white">Monitoramento de Atividades em Tempo Real</h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {filteredLogs.length} logs encontrados
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-zinc-500 text-sm font-light">Sintonizando atividades de auditoria...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-zinc-700 stroke-[1.5]" />
            <p className="text-md font-light mb-1">Nenhum evento registrado corresponde aos filtros.</p>
            <p className="text-xs text-zinc-600">Monitore as ações fazendo login, logout ou atualizando planos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/10 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                  <th className="py-4 px-6">Hora</th>
                  <th className="py-4 px-6">Usuário (UID / E-mail)</th>
                  <th className="py-4 px-6">Ação</th>
                  <th className="py-4 px-6">Metadados de Contexto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-6 font-mono text-xs text-cyan-400/80 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString('pt-BR')} {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </td>

                    {/* UID & Email */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col max-w-[280px]">
                        <span className="text-xs font-mono text-zinc-400 truncate" title={log.uid}>
                          {log.uid}
                        </span>
                        {log.metadata?.email && (
                          <span className="text-xs text-cyan-400/70 truncate">
                            {log.metadata.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium">
                        {getActionIcon(log.action)}
                        <span className="font-semibold">{log.action}</span>
                      </span>
                    </td>

                    {/* Metadata */}
                    <td className="py-4 px-6">
                      <div className="text-xs font-mono text-zinc-500 bg-black/40 p-2.5 rounded-xl border border-zinc-900/50 max-w-lg overflow-x-auto">
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <div className="space-y-0.5">
                            {Object.entries(log.metadata).map(([key, val]) => {
                              if (key === 'email') return null; // Já mostrado no usuário
                              return (
                                <div key={key} className="flex gap-1.5">
                                  <span className="text-zinc-400 font-semibold">{key}:</span>
                                  <span className="text-zinc-300 truncate">{String(val)}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">Sem metadados adicionais</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

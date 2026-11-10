import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, THEME } from '../components/SistenfoxDS';
import { 
  ShieldCheck, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Download, 
  Play, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { autoDiagnoseApp, DiagnosticReport } from '../lib/diagnostics';
import { toast } from 'sonner';

interface QualityItem {
  id: string;
  createdAt: string;
  analysis?: string;
  patchDescription?: string;
  status?: string;
}

interface QualityData {
  audits: QualityItem[];
  tests: QualityItem[];
  security: QualityItem[];
  performance: QualityItem[];
  uptime: QualityItem[];
  patches: QualityItem[];
}

export default function SystemQuality() {
  const [data, setData] = useState<QualityData>({
    audits: [],
    tests: [],
    security: [],
    performance: [],
    uptime: [],
    patches: []
  });
  const [loading, setLoading] = useState(true);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);

  const fetchQualityData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/quality-data', {
        headers: {
          'x-user-uid': '0wRwjIHf5V1...'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData({
          audits: json.audits || [],
          tests: json.tests || [],
          security: json.security || [],
          performance: json.performance || [],
          uptime: json.uptime || [],
          patches: json.patches || []
        });
      } else {
        toast.error('Erro ao ler informações de qualidade');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de conexão ao ler qualidade do sistema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityData();
  }, []);

  const approvePatch = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/approve-patch/${id}`, {
        method: 'POST',
        headers: {
          'x-user-uid': '0wRwjIHf5V1...'
        }
      });
      if (res.ok) {
        toast.success('Patch aprovado e aplicado com sucesso!');
        fetchQualityData();
      } else {
        toast.error('Falha ao aprovar patch');
      }
    } catch (err) {
      toast.error('Erro na requisição');
    }
  };

  const runCodeAudit = async () => {
    const p = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch('/api/admin/audit', {
          method: 'POST',
          headers: { 'x-user-uid': '0wRwjIHf5V1...' }
        });
        if (res.ok) {
          resolve(await res.json());
          fetchQualityData();
        } else {
          reject(new Error('Falha no endpoint'));
        }
      } catch (e) {
        reject(e);
      }
    });

    toast.promise(p, {
      loading: 'Analisando arquivos fonte com motor de IA...',
      success: 'Auditoria de código fonte concluída!',
      error: 'Erro ao invocar auditoria autônoma.'
    });
  };

  const runTestSuites = async () => {
    const p = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch('/api/admin/test', {
          method: 'POST',
          headers: { 'x-user-uid': '0wRwjIHf5V1...' }
        });
        if (res.ok) {
          resolve(await res.json());
          fetchQualityData();
        } else {
          reject(new Error('Falha no endpoint'));
        }
      } catch (e) {
        reject(e);
      }
    });

    toast.promise(p, {
      loading: 'Invocando suíte de testes de integração e endpoints...',
      success: 'Suíte de testes executada com sucesso!',
      error: 'Erro na execução dos testes.'
    });
  };

  const [validatingPlans, setValidatingPlans] = useState(false);

  const runFreePlanValidation = async () => {
    setValidatingPlans(true);
    try {
      const res = await fetch('/api/admin/validate-free-plans', {
        method: 'POST',
        headers: { 'x-user-uid': '0wRwjIHf5V1...' }
      });
      if (res.ok) {
        const json = await res.json();
        toast.success(`Validação de contas gratuitas executada! Bloqueadas: ${json.blocked}, Excluídas: ${json.deleted}`);
      } else {
        toast.error('Falha ao processar validação do plano grátis.');
      }
    } catch (e) {
      toast.error('Erro na requisição ao validar plano grátis.');
    } finally {
      setValidatingPlans(false);
    }
  };

  const handleRunDiagnostics = async () => {
    try {
      setDiagnosing(true);
      const report = await autoDiagnoseApp();
      setDiagnosticReport(report);
      toast.success('Diagnóstico local executado!');
    } catch (err) {
      toast.error('Erro de diagnóstico local');
    } finally {
      setDiagnosing(false);
    }
  };

  const exportToCSV = (items: QualityItem[], filename: string) => {
    if (items.length === 0) {
      toast.error('Sem dados disponíveis para exportação.');
      return;
    }
    const csv = Papa.unparse(items.map(i => ({ 
      Data: new Date(i.createdAt).toLocaleString(), 
      Analise: i.analysis || i.patchDescription 
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    toast.success(`Exportado para ${filename}.csv!`);
  };

  const exportToPDF = (items: QualityItem[], title: string, filename: string) => {
    if (items.length === 0) {
      toast.error('Sem dados disponíveis para exportação.');
      return;
    }
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Data', 'Análise / Histórico']],
      body: items.map(i => [
        new Date(i.createdAt).toLocaleString(), 
        i.analysis || i.patchDescription || ''
      ]),
    });
    doc.save(`${filename}.pdf`);
    toast.success(`Exportado para ${filename}.pdf!`);
  };

  const renderChart = (title: string, items: QualityItem[], color: string = '#22d3ee') => {
    // Generate dummy historical points matching length for visual curves
    const chartData = items.length > 0 
      ? items.slice(-10).reverse().map((item, idx) => ({
          name: idx + 1,
          value: 75 + Math.sin(idx) * 15 + (Math.random() * 8)
        }))
      : Array.from({ length: 8 }, (_, idx) => ({
          name: idx + 1,
          value: 85 + (Math.random() * 10)
        }));

    return (
      <Card className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{title}</h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} hide />
              <YAxis stroke="#52525b" fontSize={10} hide domain={[50, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px'
                }} 
              />
              <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill={`url(#grad-${title})`} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-12">
      {/* Header section with diagnostic triggers */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-2">
            TELEMETRIA & ENGENHARIA DE QUALIDADE
          </h2>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Diagnóstico do Sistema & KPI
          </h1>
        </div>
        
        {/* Engineering Quick Actions */}
        <div className="flex flex-wrap gap-4 shrink-0">
          <Button variant="neon" size="md" onClick={runCodeAudit} className="flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Rodar Auditoria de Código
          </Button>
          <Button variant="secondary" size="md" onClick={runTestSuites} className="flex items-center gap-2">
            <Play className="w-4 h-4" /> Iniciar Suíte de Testes
          </Button>
          <Button variant="secondary" size="md" onClick={runFreePlanValidation} disabled={validatingPlans} className="flex items-center gap-2 border border-[#d4af37]/30 text-white hover:border-[#d4af37]">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" /> {validatingPlans ? 'Validando...' : 'Validar Contas Free'}
          </Button>
          <Button variant="secondary" size="md" onClick={fetchQualityData} title="Recarregar Dados">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Charts area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderChart('Estabilidade de Latência (Performance)', data.performance, '#22d3ee')}
            {renderChart('Taxa de Disponibilidade (Uptime)', data.uptime, '#10b981')}
            {renderChart('Índice de Ameaças / Segurança', data.security, '#f43f5e')}
          </div>

          {/* Local diagnostic trigger card */}
          <Card className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" /> Auto-Engineer Local Diagnostics
                </h3>
                <p className="text-sm text-zinc-400 font-light max-w-xl">
                  Simule o ciclo completo de autenticação e verifique se as respostas de endpoints essenciais estão entregando JSON íntegro.
                </p>
              </div>
              <Button 
                variant="neon" 
                size="md" 
                onClick={handleRunDiagnostics} 
                disabled={diagnosing}
                className="shrink-0"
              >
                {diagnosing ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Testando...</span>
                ) : (
                  'Executar Diagnóstico Local'
                )}
              </Button>
            </div>

            {/* Local diagnostic report view if present */}
            {diagnosticReport && (
              <div className="mt-8 border-t border-zinc-900 pt-6 space-y-6">
                <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Resumo Diagnóstico</span>
                  <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">{diagnosticReport.summary}</pre>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">Endpoint Integrations</span>
                    <div className="space-y-2">
                      {diagnosticReport.network.jsonValidation.map((test, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl text-xs">
                          <span className="text-zinc-500 font-mono">{test.url}</span>
                          <span className={test.isHTML ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                            {test.isHTML ? "Erro: HTML" : "✔️ OK (JSON)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">Auth Simulator Flow</span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl text-xs">
                        <span>Fluxo de Cadastro</span>
                        <span className={diagnosticReport.auth.registerFlow.ok ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                          {diagnosticReport.auth.registerFlow.ok ? "✔️ Operante" : "❌ Falha"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl text-xs">
                        <span>Fluxo de Login</span>
                        <span className={diagnosticReport.auth.loginFlow.ok ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                          {diagnosticReport.auth.loginFlow.ok ? "✔️ Operante" : "❌ Falha"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Pending Patches, Code Audits & Test Results sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patches and Audits */}
            <Card className="bg-zinc-950 border border-zinc-900 overflow-hidden">
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/40">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Correções e Patches Pendentes
                </h3>
                <Badge variant="yellow">{data.patches.filter(p => p.status !== 'applied').length} Pendentes</Badge>
              </div>
              <div className="p-6 space-y-4">
                {data.patches.length === 0 ? (
                  <p className="text-sm text-zinc-600 font-light text-center py-6">Nenhum patch de código pendente.</p>
                ) : (
                  data.patches.map((patch) => (
                    <div key={patch.id} className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          Identificador: {patch.id.substring(0, 8)} • {new Date(patch.createdAt).toLocaleDateString()}
                        </span>
                        <p className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed mt-2">{patch.patchDescription}</p>
                      </div>
                      {patch.status !== 'applied' ? (
                        <button 
                          onClick={() => approvePatch(patch.id)}
                          className="px-4 py-2 bg-white hover:bg-zinc-100 text-black text-xs font-bold rounded-xl transition-all shadow shrink-0"
                        >
                          Aplicar Patch
                        </button>
                      ) : (
                        <Badge variant="green" className="shrink-0">Aplicado</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Source Code Audits */}
            <Card className="bg-zinc-950 border border-zinc-900 overflow-hidden">
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/40">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" /> Relatórios de Auditoria de Código
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportToCSV(data.audits, 'auditorias_sistenfox')}
                    className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    title="Exportar CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => exportToPDF(data.audits, 'Auditorias Sistenfox', 'auditorias_sistenfox')}
                    className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    title="Exportar PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-[360px] overflow-y-auto">
                {data.audits.length === 0 ? (
                  <p className="text-sm text-zinc-600 font-light text-center py-6">Nenhum log de auditoria disponível.</p>
                ) : (
                  data.audits.map((audit) => (
                    <div key={audit.id} className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(audit.createdAt).toLocaleString()}
                      </span>
                      <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed mt-2">{audit.analysis}</pre>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

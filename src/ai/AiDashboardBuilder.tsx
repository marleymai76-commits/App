import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Plus, 
  Settings, 
  Eye, 
  Trash2,
  TrendingUp,
  LayoutGrid,
  Heart,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/SistenfoxDS';
import { generateDashboardWithAi } from './AiEngine';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface MetricWidget {
  label: string;
  value: string;
  change: string;
  chartType: string;
  color: string;
}

export default function AiDashboardBuilder() {
  const { user } = useAuth();
  const [businessType, setBusinessType] = useState('restaurant');
  const [metricType, setMetricType] = useState('financial');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generated Dashboard Schema State
  const [metrics, setMetrics] = useState<MetricWidget[]>([
    { label: 'Receita Líquida', value: 'R$ 18.250,00', change: '+12%', chartType: 'area', color: '#22d3ee' },
    { label: 'Pedidos Efetuados', value: '185 un', change: '+5%', chartType: 'bar', color: '#a78bfa' },
    { label: 'Aproveitamento', value: '94.2%', change: '+3%', chartType: 'line', color: '#10b981' }
  ]);
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([
    { name: 'Seg', value: 4000 },
    { name: 'Ter', value: 3000 },
    { name: 'Qua', value: 5000 },
    { name: 'Qui', value: 8500 },
    { name: 'Sex', value: 12000 },
    { name: 'Sáb', value: 15000 },
    { name: 'Dom', value: 11000 }
  ]);
  const [tableColumns, setTableColumns] = useState<string[]>(['Membro / Cliente', 'Pedido / Serviço', 'Data', 'Status']);
  const [tableRows, setTableRows] = useState<any[]>([
    { id: '1', user: 'Marley Mai', event: 'Reserva Bistrô Premium', time: '14:32', status: 'Concluído' },
    { id: '2', user: 'Ana Paula', event: 'Combo Brunch Duplo', time: '15:10', status: 'Em preparo' },
    { id: '3', user: 'Carlos Silva', event: 'Jantar Degustação', time: '16:05', status: 'Aguardando' }
  ]);

  const handleGenerateDashboard = async () => {
    try {
      setIsGenerating(true);
      
      const response = await generateDashboardWithAi({
        businessType,
        metricType
      }, user?.uid || '0wRwjIHf5V1...');

      setMetrics(response.metrics);
      setChartData(response.charts);
      setTableColumns(response.columns);
      setTableRows(response.recentActivity);

      toast.success('Estrutura de dashboard customizada gerada com IA!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao gerar layout de painel.');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteMetric = (index: number) => {
    const updated = [...metrics];
    updated.splice(index, 1);
    setMetrics(updated);
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'operational': return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'marketing': return <BarChart3 className="w-4 h-4 text-amber-400" />;
      default: return <Heart className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="cyan" className="text-xs tracking-[0.2em] font-extrabold px-3 py-1 bg-cyan-950/40 border-cyan-400/20">
            FOX DASHBOARD BUILDER
          </Badge>
          <span className="text-zinc-600 font-mono text-xs">AI GENERATED LAYOUTS</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-4">
          Gerador de Dashboards com IA
        </h1>
        <p className="text-zinc-400 text-lg font-light max-w-2xl">
          Selecione o modelo do seu inquilino e assista à inteligência artificial desenhar métricas, painéis, gráficos e tabelas simuladas.
        </p>
      </div>

      {/* Control Card */}
      <Card className="bg-zinc-950 border border-zinc-900 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tipo de Negócio do Cliente</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-3 text-sm focus:border-cyan-400 outline-none transition-all"
            >
              <option value="restaurant">Restaurante / Alimentação</option>
              <option value="store">Loja / E-commerce / Varejo</option>
              <option value="service">Serviços / Salão / Estética</option>
              <option value="custom">Plataformas SaaS / Customizado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Métricas & Telemetria Principal</label>
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-3 text-sm focus:border-cyan-400 outline-none transition-all"
            >
              <option value="financial">Desempenho Financeiro (Faturamento, Ticket)</option>
              <option value="operational">Eficiência Operacional (Produtividade, Tempo)</option>
              <option value="marketing">Marketing & Tráfego (Conversão, Cliques)</option>
              <option value="customer">Fidelidade do Cliente (NPS, Retenção)</option>
            </select>
          </div>

          <div>
            <Button
              variant="neon"
              onClick={handleGenerateDashboard}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold py-3.5"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Gerando Layout...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" /> Projetar Painel por IA
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Workspace Preview */}
      {isGenerating ? (
        <Card className="bg-zinc-950 border border-zinc-900 p-12 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
          <div className="text-center">
            <p className="text-sm text-white font-medium">Reestruturando dados de telemetria por IA...</p>
            <p className="text-xs text-zinc-500 font-light mt-1">Isso configurará os componentes charts do Design System Sistenfox</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">WORKSPACE PREVIEW (PRONTO PARA INTEGRAÇÃO)</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE MOCK
            </span>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric, i) => (
              <Card key={i} className="bg-zinc-950 border border-zinc-900 p-5 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 text-zinc-800 group-hover:text-cyan-500/20 transition-colors">
                  {getMetricIcon(metricType)}
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">{metric.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">{metric.value}</span>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">{metric.change}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                  <Badge variant="cyan" style={{ borderColor: metric.color + '30', color: metric.color }}>
                    Chart: {metric.chartType}
                  </Badge>
                  <button 
                    onClick={() => deleteMetric(i)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}

            <div className="border border-dashed border-zinc-900 hover:border-cyan-400/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-zinc-950/20">
              <Plus className="w-6 h-6 text-zinc-600 mb-2" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Adicionar Widget</span>
            </div>
          </div>

          {/* Interactive Chart & Data Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Chart Area (7 cols) */}
            <Card className="bg-zinc-950 border border-zinc-900 p-6 lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Séries Temporais (Desempenho Semanal)</span>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Table Area (5 cols) */}
            <Card className="bg-zinc-950 border border-zinc-900 p-6 lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Registro de Eventos Críticos</span>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500">
                      {tableColumns.map((col, idx) => (
                        <th key={idx} className="pb-3 font-semibold uppercase tracking-wider">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.id} className="border-b border-zinc-900/40 hover:bg-zinc-900/10">
                        <td className="py-3.5 font-medium text-white">{row.user}</td>
                        <td className="py-3.5 text-zinc-400">{row.event}</td>
                        <td className="py-3.5 text-zinc-500 font-mono">{row.time}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.status === 'Concluído' 
                              ? 'bg-emerald-950/40 border border-emerald-400/20 text-emerald-400' 
                              : 'bg-amber-950/40 border border-amber-400/20 text-amber-400'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

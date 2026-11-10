import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import BackButton from './BackButton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const salesData = [
  { name: 'Jan', vendas: 4000, lucro: 2400 },
  { name: 'Fev', vendas: 3000, lucro: 1398 },
  { name: 'Mar', vendas: 2000, lucro: 9800 },
  { name: 'Abr', vendas: 2780, lucro: 3908 },
  { name: 'Mai', vendas: 1890, lucro: 4800 },
  { name: 'Jun', vendas: 2390, lucro: 3800 },
];

const categoryData = [
  { name: 'Pratos Principais', value: 400 },
  { name: 'Bebidas', value: 300 },
  { name: 'Sobremesas', value: 200 },
  { name: 'Entradas', value: 100 },
];

const COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#8B4513'];

const peakHoursData = [
  { hour: '11:00', pedidos: 12 },
  { hour: '12:00', pedidos: 45 },
  { hour: '13:00', pedidos: 58 },
  { hour: '14:00', pedidos: 30 },
  { hour: '18:00', pedidos: 15 },
  { hour: '19:00', pedidos: 50 },
  { hour: '20:00', pedidos: 85 },
  { hour: '21:00', pedidos: 70 },
  { hour: '22:00', pedidos: 40 },
];

const employeePerformance = [
  { name: 'Carlos', vendas: 4500, pedidos: 52 },
  { name: 'Ana', vendas: 3800, pedidos: 48 },
  { name: 'Ricardo', vendas: 3200, pedidos: 40 },
  { name: 'Juliana', vendas: 2900, pedidos: 35 },
];

export default function Reports({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const downloadCSV = () => {
    const headers = ['Mês', 'Vendas (R$)', 'Lucro (R$)'];
    const rows = salesData.map(d => `${d.name},${d.vendas},${d.lucro}`);
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Desempenho - SISTENFOX', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Data de geração: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Sales Data Table
    doc.setFontSize(14);
    doc.text('Vendas e Lucro por Mês', 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Mês', 'Vendas (R$)', 'Lucro (R$)']],
      body: salesData.map(d => [d.name, d.vendas.toString(), d.lucro.toString()]),
      theme: 'grid',
      headStyles: { fillColor: [218, 165, 32] }, // Gold color
    });
    
    // Employee Performance Table
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    
    doc.text('Desempenho de Funcionários', 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Funcionário', 'Vendas (R$)', 'Pedidos']],
      body: employeePerformance.map(d => [d.name, d.vendas.toString(), d.pedidos.toString()]),
      theme: 'grid',
      headStyles: { fillColor: [218, 165, 32] },
    });
    
    doc.save(`relatorio_sistenfox_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExport = (format: 'CSV' | 'PDF') => {
    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          if (format === 'CSV') {
            downloadCSV();
          } else if (format === 'PDF') {
            await downloadPDF();
          }
          // Simulate a short delay for better UX
          setTimeout(() => resolve(), 800);
        } catch (error) {
          reject(error);
        }
      }),
      {
        loading: `Gerando relatório em ${format}...`,
        success: `Relatório ${format} baixado com sucesso!`,
        error: 'Erro ao gerar relatório.',
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <DashboardHeader 
        title="Relatórios e Análises" 
        subtitle="Visualize o desempenho detalhado do seu negócio." 
        onMenuToggle={onMenuToggle}
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 premium-card py-4 border border-[#E2E8F0] dark:border-gold/10 shadow-sm bg-white dark:bg-card-app">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-gold/5 border border-[#E2E8F0] dark:border-gold/20 rounded-xl shadow-xs">
            <Calendar size={18} className="text-[#0F172A] dark:text-gold" />
            <select className="bg-transparent border-none outline-none text-sm font-bold text-[#0F172A] dark:text-gold cursor-pointer">
              <option value="today" className="text-slate-900 bg-white dark:bg-zinc-900 dark:text-white">Hoje</option>
              <option value="week" className="text-slate-900 bg-white dark:bg-zinc-900 dark:text-white">Esta Semana</option>
              <option value="month" className="text-slate-900 bg-white dark:bg-zinc-900 dark:text-white" selected>Este Mês</option>
              <option value="year" className="text-slate-900 bg-white dark:bg-zinc-900 dark:text-white">Este Ano</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1E293B] border border-[#E2E8F0] dark:bg-gold/5 dark:hover:bg-gold/10 dark:text-gold/80 dark:border-gold/10 rounded-xl transition-colors text-sm font-semibold shadow-xs">
            <Filter size={18} className="text-[#0F172A] dark:text-gold" />
            Filtros Avançados
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white border border-[#0F172A] dark:bg-gold/10 dark:text-gold dark:border-gold/20 dark:hover:bg-gold/20 rounded-xl transition-all text-sm font-bold shadow-sm"
          >
            <FileText size={18} />
            PDF
          </button>
          <button 
            onClick={() => handleExport('CSV')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white border border-[#1E293B] dark:gold-gradient dark:text-premium-black rounded-xl hover:scale-105 transition-all text-sm font-bold shadow-md shadow-slate-900/10 dark:shadow-gold/20"
          >
            <Download size={18} />
            CSV
          </button>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Crescimento de Vendas', value: '+24.5%', trend: 'up', color: 'text-emerald-600 dark:text-green-500' },
          { label: 'Ticket Médio', value: 'R$ 84,20', trend: 'up', color: 'text-emerald-600 dark:text-green-500' },
          { label: 'Cancelamentos', value: '1.2%', trend: 'down', color: 'text-rose-600 dark:text-red-500' },
          { label: 'Novos Clientes', value: '156', trend: 'up', color: 'text-emerald-600 dark:text-green-500' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card bg-white dark:bg-card-app border border-[#E2E8F0] dark:border-gold/10 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-600 dark:text-zinc-400 uppercase font-bold tracking-wider">{item.label}</span>
              {item.trend === 'up' ? (
                <ArrowUpRight className={item.color} size={16} />
              ) : (
                <ArrowDownRight className={item.color} size={16} />
              )}
            </div>
            <div className={cn("text-2xl font-bold", item.color)}>{item.value}</div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-2 uppercase tracking-wider font-bold">vs período anterior</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card bg-white dark:bg-card-app border border-[#E2E8F0] dark:border-gold/10 shadow-sm">
          <h3 className="text-lg font-serif font-bold mb-6 text-[#0F172A] dark:text-white dark:gold-text-gradient">Vendas vs Lucro</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-app)', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                <Bar dataKey="vendas" fill="#0F172A" radius={[4, 4, 0, 0]} name="Vendas" />
                <Bar dataKey="lucro" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card bg-white dark:bg-card-app border border-[#E2E8F0] dark:border-gold/10 shadow-sm">
          <h3 className="text-lg font-serif font-bold mb-6 text-[#0F172A] dark:text-white dark:gold-text-gradient">Horários de Pico</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-app)', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="pedidos" fill="#0F172A" radius={[4, 4, 0, 0]} name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="premium-card bg-white dark:bg-card-app border border-[#E2E8F0] dark:border-gold/10 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-serif font-bold mb-6 text-[#0F172A] dark:text-white dark:gold-text-gradient">Categorias</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-app)', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card bg-white dark:bg-card-app border border-[#E2E8F0] dark:border-gold/10 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-serif font-bold mb-6 text-[#0F172A] dark:text-white dark:gold-text-gradient">Desempenho de Funcionários</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeePerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-app)', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="vendas" fill="#0F172A" radius={[0, 4, 4, 0]} name="Vendas (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="premium-card bg-white dark:bg-card-app border border-[#E2E8F0] dark:border-gold/10 shadow-sm">
        <h3 className="text-lg font-serif font-bold mb-6 text-[#0F172A] dark:text-white dark:gold-text-gradient">Top Produtos Vendidos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-700 dark:text-gold/70 border-b border-[#E2E8F0] dark:border-gold/10 font-bold">
                <th className="pb-4 font-bold">Produto</th>
                <th className="pb-4 font-bold">Categoria</th>
                <th className="pb-4 font-bold">Quantidade</th>
                <th className="pb-4 font-bold">Receita</th>
                <th className="pb-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { 
                  name: 'Picanha Premium', 
                  desc: 'Corte nobre com acompanhamentos',
                  img: 'https://images.unsplash.com/photo-1594046243098-0fceea9d451e?w=100&h=100&fit=crop',
                  cat: 'Pratos Principais', 
                  qty: 145, 
                  rev: 'R$ 12.450', 
                  status: 'Alta' 
                },
                { 
                  name: 'Vinho Tinto Reserva', 
                  desc: 'Safra 2018, 750ml',
                  img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=100&h=100&fit=crop',
                  cat: 'Bebidas', 
                  qty: 89, 
                  rev: 'R$ 8.900', 
                  status: 'Estável' 
                },
                { 
                  name: 'Petit Gateau', 
                  desc: 'Com sorvete de creme artesanal',
                  img: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=100&h=100&fit=crop',
                  cat: 'Sobremesas', 
                  qty: 210, 
                  rev: 'R$ 4.200', 
                  status: 'Alta' 
                },
                { 
                  name: 'Bruschetta Italiana', 
                  desc: 'Pão italiano, tomate e manjericão',
                  img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=100&h=100&fit=crop',
                  cat: 'Entradas', 
                  qty: 67, 
                  rev: 'R$ 1.340', 
                  status: 'Baixa' 
                },
              ].map((prod, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-gold/5 last:border-0 hover:bg-slate-50 dark:hover:bg-gold/5 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={prod.img} 
                        alt={prod.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-gold/20"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{prod.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-white/50 mt-0.5">{prod.desc}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-slate-600 dark:text-zinc-400 font-medium">{prod.cat}</td>
                  <td className="py-4 font-semibold text-slate-900 dark:text-white">{prod.qty}</td>
                  <td className="py-4 font-bold text-slate-900 dark:text-white">{prod.rev}</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase",
                      prod.status === 'Alta' ? "bg-emerald-100 text-emerald-800 dark:bg-green-500/10 dark:text-green-500" :
                      prod.status === 'Estável' ? "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500" :
                      "bg-rose-100 text-rose-800 dark:bg-red-500/10 dark:text-red-500"
                    )}>
                      {prod.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

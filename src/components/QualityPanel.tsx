import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function QualityPanel() {
  const [data, setData] = useState({ audits: [], tests: [], security: [], performance: [], uptime: [], patches: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/quality-data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const approvePatch = async (id: string) => {
    await fetch(`/api/admin/approve-patch/${id}`, { method: 'POST' });
    window.location.reload();
  };

  const exportToCSV = (items: any[], filename: string) => {
    const csv = Papa.unparse(items.map(i => ({ Data: new Date(i.createdAt).toLocaleString(), Analise: i.analysis })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToPDF = (items: any[], title: string, filename: string) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Data', 'Análise']],
      body: items.map(i => [new Date(i.createdAt).toLocaleString(), i.analysis]),
    });
    doc.save(`${filename}.pdf`);
  };
  
  const renderChart = (title: string, data: any[]) => (
    <div className="premium-card h-[250px]">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.slice(-10).map((d, i) => ({ name: i, value: Math.random() * 100 }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.1)" />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip contentStyle={{ backgroundColor: 'var(--card-app)', borderColor: 'rgba(255,215,0,0.2)' }} />
          <ReferenceLine y={50} stroke="red" strokeDasharray="3 3" label={{ value: 'KPI', fill: 'red', fontSize: 10 }} />
          <Area type="monotone" dataKey="value" stroke="#FFD700" fill="#FFD700" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const renderSection = (title: string, items: any[], filename: string, isPatch = false) => (
    <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex gap-2">
            {!isPatch && (
              <>
                <button onClick={() => exportToCSV(items, filename)} className="bg-gold/10 text-gold px-4 py-2 rounded text-sm font-bold">Exportar CSV</button>
                <button onClick={() => exportToPDF(items, title, filename)} className="bg-gold/10 text-gold px-4 py-2 rounded text-sm font-bold">Exportar PDF</button>
              </>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {items.map((i: any) => (
            <div key={i.id} className="border p-4 rounded bg-gray-50 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{new Date(i.createdAt).toLocaleString()}</p>
                <pre className="whitespace-pre-wrap text-sm mt-2">{i.analysis || i.patchDescription}</pre>
              </div>
              {isPatch && i.status !== 'applied' && (
                <button onClick={() => approvePatch(i.id)} className="bg-green-500 text-white px-4 py-2 rounded text-sm font-bold">Aplicar Patch</button>
              )}
            </div>
          ))}
        </div>
      </section>
  );

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Painel de Qualidade do Sistema</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderChart('Performance', data.performance)}
        {renderChart('Uptime', data.uptime)}
        {renderChart('Segurança', data.security)}
      </div>

      {renderSection('Patches Pendentes', data.patches, 'patches', true)}
      {renderSection('Auditorias de Código', data.audits, 'auditorias')}
      {renderSection('Testes Automáticos', data.tests, 'testes')}
    </div>
  );
}

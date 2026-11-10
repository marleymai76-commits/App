import React from 'react';
import { motion } from 'motion/react';
import { 
  Scissors, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Stethoscope, 
  UserCheck, 
  FileText, 
  Wrench, 
  CheckCircle, 
  AlertTriangle, 
  ShoppingCart, 
  Layers, 
  Package, 
  Building2, 
  HardHat, 
  Users 
} from 'lucide-react';

// Common Stat Card Component
function StatCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <div className="premium-card bg-[#0f0f0f] border border-[#d4af37]/20 hover:border-[#d4af37]/40 p-6 rounded-2xl relative overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-serif font-bold text-white mb-2">{value}</h3>
          <span className="text-xs text-green-500 font-semibold">{change}</span>
        </div>
        <div className={`p-3 rounded-xl bg-white/5 text-[#d4af37]`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// 1. Salão & Estética Dashboard
export function SalaoDashboard() {
  const appointments = [
    { client: 'Gisele Bündchen', service: 'Mechas Premium + Escova', hour: '14:30', status: 'Em andamento', stylist: 'Marcio M.' },
    { client: 'Juliana Paes', service: 'Design de Sobrancelha', hour: '15:45', status: 'Confirmado', stylist: 'Ana L.' },
    { client: 'Grazi Massafera', service: 'Manicure de Luxo', hour: '16:30', status: 'Confirmado', stylist: 'Clara S.' },
    { client: 'Camila Pitanga', service: 'Hidratação Orgânica', hour: '17:15', status: 'Pendente', stylist: 'Marcio M.' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Agendamentos de Hoje" value="18" change="+12% em relação a ontem" icon={Calendar} />
        <StatCard title="Faturamento do Dia" value="R$ 3.450" change="+8% que semana passada" icon={TrendingUp} />
        <StatCard title="Stylists Ativos" value="5 / 6" change="1 em intervalo" icon={Scissors} />
        <StatCard title="Ticket Médio" value="R$ 192" change="+15% este mês" icon={Sparkles} />
      </div>

      <div className="premium-card bg-[#0f0f0f] border border-[#d4af37]/20 p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6 font-serif">Próximos Agendamentos de Beleza</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Serviço</th>
                <th className="pb-3">Horário</th>
                <th className="pb-3">Profissional</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-800/40">
              {appointments.map((ap, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="py-4 font-medium text-white">{ap.client}</td>
                  <td className="py-4 text-zinc-400">{ap.service}</td>
                  <td className="py-4 text-zinc-300 font-mono">{ap.hour}</td>
                  <td className="py-4 text-zinc-400">{ap.stylist}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      ap.status === 'Em andamento' ? 'bg-amber-500/10 text-amber-500' :
                      ap.status === 'Confirmado' ? 'bg-green-500/10 text-green-500' :
                      'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {ap.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. Clínica & Consultório Dashboard
export function ClinicaDashboard() {
  const consultations = [
    { patient: 'Dr. Roberto Santos', specialty: 'Cardiologia', hour: '14:00', status: 'Concluído', sala: 'Consultório 1' },
    { patient: 'Dra. Maria Cláudia', specialty: 'Dermatologia', hour: '14:45', status: 'Chamando...', sala: 'Consultório 3' },
    { patient: 'Fernanda Montenegro', specialty: 'Geriatria', hour: '15:30', status: 'Aguardando', sala: 'Recepção' },
    { patient: 'Silvio Santos', specialty: 'Neurologia', hour: '16:15', status: 'Aguardando', sala: 'Consultório 2' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pacientes Agendados" value="24" change="+5% que a meta diária" icon={Calendar} />
        <StatCard title="Consultas Atendidas" value="14" change="10 restantes para hoje" icon={UserCheck} />
        <StatCard title="Prontuários Assinados" value="12 / 14" change="2 pendentes" icon={FileText} />
        <StatCard title="Faturamento Estimado" value="R$ 5.800" change="Consultas particulares" icon={Stethoscope} />
      </div>

      <div className="premium-card bg-[#0f0f0f] border border-[#d4af37]/20 p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6 font-serif">Painel de Atendimento Médico</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <th className="pb-3">Paciente / Médico</th>
                <th className="pb-3">Especialidade</th>
                <th className="pb-3">Horário</th>
                <th className="pb-3">Localização</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-800/40">
              {consultations.map((c, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="py-4 font-medium text-white">{c.patient}</td>
                  <td className="py-4 text-zinc-400">{c.specialty}</td>
                  <td className="py-4 text-zinc-300 font-mono">{c.hour}</td>
                  <td className="py-4 text-zinc-400">{c.sala}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      c.status === 'Concluído' ? 'bg-green-500/10 text-green-500' :
                      c.status === 'Chamando...' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. Oficina Mecânica Dashboard
export function OficinaDashboard() {
  const cars = [
    { vehicle: 'Porsche 911 Carrera S', plate: 'SFX-2026', service: 'Revisão Motor + Pastilhas', technician: 'Toninho Turbo', status: 'Em Reparo' },
    { vehicle: 'Audi RS6 Avant', plate: 'DGT-7777', service: 'Troca de Escape Esportivo', technician: 'Cleber Rodas', status: 'Aguardando Peça' },
    { vehicle: 'BMW M3 Competition', plate: 'BM-2026', service: 'Alinhamento & Balanceamento 3D', technician: 'Toninho Turbo', status: 'Pronto' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Carros no Box" value="14" change="Capacidade de pátio: 85%" icon={Wrench} />
        <StatCard title="Orçamentos Aprovados" value="8" change="R$ 32.400 em serviços" icon={TrendingUp} />
        <StatCard title="Serviços Concluídos" value="5" change="Hoje" icon={CheckCircle} />
        <StatCard title="Alertas de Peças" value="3" change="Aguardando importação" icon={AlertTriangle} />
      </div>

      <div className="premium-card bg-[#0f0f0f] border border-[#d4af37]/20 p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6 font-serif">Ordens de Serviço em Execução</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <th className="pb-3">Veículo</th>
                <th className="pb-3">Placa</th>
                <th className="pb-3">Serviço Solicitado</th>
                <th className="pb-3">Mecânico Líder</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-800/40">
              {cars.map((car, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="py-4 font-medium text-white">{car.vehicle}</td>
                  <td className="py-4 text-zinc-400 font-mono">{car.plate}</td>
                  <td className="py-4 text-zinc-300">{car.service}</td>
                  <td className="py-4 text-zinc-400">{car.technician}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      car.status === 'Em Reparo' ? 'bg-amber-500/10 text-amber-500' :
                      car.status === 'Pronto' ? 'bg-green-500/10 text-green-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {car.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 4. Mercado / Minimercado Dashboard
export function MercadoDashboard() {
  const sales = [
    { time: '14:52', pdv: 'Caixa 1', items: '12 itens', total: 'R$ 184,50', type: 'Crédito' },
    { time: '14:50', pdv: 'Caixa 2', items: '4 itens', total: 'R$ 42,90', type: 'Pix' },
    { time: '14:48', pdv: 'Caixa 1', items: '24 itens', total: 'R$ 412,00', type: 'Débito' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Vendas do Dia" value="142" change="+14% que no sábado passado" icon={ShoppingCart} />
        <StatCard title="Faturamento Total" value="R$ 8.920" change="Ticket Médio: R$ 62,80" icon={TrendingUp} />
        <StatCard title="Alertas de Estoque" value="18" change="Itens com estoque crítico" icon={AlertTriangle} />
        <StatCard title="Caixas Ativos" value="3 / 4" change="PDVs online" icon={Layers} />
      </div>

      <div className="premium-card bg-[#0f0f0f] border border-[#d4af37]/20 p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6 font-serif">Monitor de Vendas PDV em Tempo Real</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <th className="pb-3">Horário</th>
                <th className="pb-3">Ponto de Venda</th>
                <th className="pb-3">Volumes</th>
                <th className="pb-3">Método de Pagamento</th>
                <th className="pb-3 text-right">Valor Final</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-800/40">
              {sales.map((s, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="py-4 font-mono text-zinc-300">{s.time}</td>
                  <td className="py-4 text-white font-medium">{s.pdv}</td>
                  <td className="py-4 text-zinc-400">{s.items}</td>
                  <td className="py-4 text-zinc-400">{s.type}</td>
                  <td className="py-4 text-right font-bold text-white">{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 5. Construção Civil Dashboard
export function ConstrucaoDashboard() {
  const projects = [
    { name: 'Residencial Golden Tower', site: 'Setor Bueno', progress: '42%', team: 'Equipe Alfa', status: 'Dentro do Prazo' },
    { name: 'Condomínio Sunset Club', site: 'Alphaville', progress: '18%', team: 'Equipe Beta', status: 'Dentro do Prazo' },
    { name: 'Corporate Business Center', site: 'Av. Paulista', progress: '85%', team: 'Equipe Gama', status: 'Atrasado' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Obras Ativas" value="3" change="Área total: 42.000m²" icon={Building2} />
        <StatCard title="Efetivo em Campo" value="84" change="Colaboradores terceirizados" icon={Users} />
        <StatCard title="Estoque de Cimento" value="340 sc" change="Suficiente para 12 dias" icon={Package} />
        <StatCard title="Uso do Orçamento" value="68%" change="Economia acumulada de 2%" icon={HardHat} />
      </div>

      <div className="premium-card bg-[#0f0f0f] border border-[#d4af37]/20 p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6 font-serif">Acompanhamento Físico-Financeiro de Obras</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <th className="pb-3">Empreendimento</th>
                <th className="pb-3">Local da Obra</th>
                <th className="pb-3">Progresso Físico</th>
                <th className="pb-3">Responsável</th>
                <th className="pb-3 text-right">Status Geral</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-800/40">
              {projects.map((proj, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="py-4 font-medium text-white">{proj.name}</td>
                  <td className="py-4 text-zinc-400">{proj.site}</td>
                  <td className="py-4 font-mono text-[#d4af37] font-bold">{proj.progress}</td>
                  <td className="py-4 text-zinc-400">{proj.team}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      proj.status === 'Dentro do Prazo' ? 'bg-green-500/10 text-green-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 6. Lojas & Varejo Dashboard
export function VarejoDashboard() {
  const sales = [
    { id: '1004', client: 'Carlos Silva', items: 'Camiseta Polo + Calça Jeans', total: 'R$ 289,90', status: 'Aprovado', pdv: 'PDV 1' },
    { id: '1003', client: 'Beatriz Costa', items: 'Tênis Running', total: 'R$ 349,90', status: 'Aprovado', pdv: 'Online' },
    { id: '1002', client: 'Daniel de Souza', items: 'Boné Premium + Cinto de Couro', total: 'R$ 145,00', status: 'Processando', pdv: 'PDV 2' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Vendas do Dia" value="74" change="+18% vs média semanal" icon={ShoppingCart} />
        <StatCard title="Faturamento Bruto" value="R$ 12.840,00" change="Ticket Médio: R$ 173,50" icon={TrendingUp} />
        <StatCard title="Giro de Estoque" value="1.2x" change="Semanal" icon={Package} />
        <StatCard title="Produtos Críticos" value="4 itens" change="Estoque menor que 5" icon={AlertTriangle} />
      </div>

      <div className="premium-card bg-[#0f0f0f] border border-[#d4af37]/20 p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6 font-serif">Últimas Transações de Varejo</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <th className="pb-3">ID Pedido</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Itens</th>
                <th className="pb-3">Canal</th>
                <th className="pb-3">Valor Total</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-800/40">
              {sales.map((s, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="py-4 text-zinc-500 font-mono">#{s.id}</td>
                  <td className="py-4 font-medium text-white">{s.client}</td>
                  <td className="py-4 text-zinc-400">{s.items}</td>
                  <td className="py-4 text-zinc-400 font-mono">{s.pdv}</td>
                  <td className="py-4 font-bold text-[#d4af37]">{s.total}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      s.status === 'Aprovado' ? 'bg-green-500/10 text-green-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

const monthlyData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Fev', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Abr', revenue: 2780 },
  { name: 'Mai', revenue: 6890 },
  { name: 'Jun', revenue: 4390 },
  { name: 'Jul', revenue: 7490 },
];

export function MonthlyRevenueChart() {
  return (
    <div className="premium-card">
      <h2 className="text-xl font-serif font-bold mb-6 gold-text-gradient">Receita Mensal</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,215,0,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,215,0,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card-app)', borderColor: 'rgba(255,215,0,0.2)', borderRadius: '12px', color: 'var(--text-app)' }} />
            <Area type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

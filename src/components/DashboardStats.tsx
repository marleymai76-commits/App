import { motion } from 'motion/react';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

const stats = [
  { label: 'Receita Total', value: 'R$ 12.450', icon: DollarSign, trend: '+12.5%', color: 'text-green-500' },
  { label: 'Novos Pedidos', value: '156', icon: ShoppingCart, trend: '+8.2%', color: 'text-blue-500' },
  { label: 'Novos Clientes', value: '42', icon: Users, trend: '+15.3%', color: 'text-purple-500' },
  { label: 'Taxa de Conversão', value: '3.2%', icon: TrendingUp, trend: '+2.1%', color: 'text-gold' },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="premium-card group hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2.5 rounded-lg bg-gold/10", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
          </div>
          <div className="text-2xl font-bold mb-1 gold-text-gradient">{stat.value}</div>
          <div className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

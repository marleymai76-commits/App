import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Utensils, 
  Calendar, 
  Bell, 
  BarChart3, 
  Package, 
  Palette, 
  Globe, 
  Smartphone,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

const features = [
  {
    title: "Dashboard Inteligente",
    desc: "Visão completa do seu negócio em tempo real com métricas avançadas.",
    icon: LayoutDashboard
  },
  {
    title: "Controle de Pedidos",
    desc: "Gestão ágil de comandas, mesas e delivery em uma única interface.",
    icon: Utensils
  },
  {
    title: "Reservas Online",
    desc: "Sistema de agendamento integrado para evitar filas e otimizar espaço.",
    icon: Calendar
  },
  {
    title: "Notificações Push",
    desc: "Mantenha seus clientes engajados com alertas e promoções diretas.",
    icon: Bell
  },
  {
    title: "Relatórios Financeiros",
    desc: "Análise profunda de lucros, gastos e tendências de crescimento.",
    icon: BarChart3
  },
  {
    title: "Controle de Estoque",
    desc: "Gestão automatizada de insumos com alertas de reposição.",
    icon: Package
  },
  {
    title: "Personalização Total",
    desc: "Altere cores, logos e banners para combinar com sua marca.",
    icon: Palette
  },
  {
    title: "Multi-Idioma",
    desc: "Pronto para o mercado global com suporte a diversos idiomas.",
    icon: Globe
  },
  {
    title: "Versão Cliente/Admin",
    desc: "Apps dedicados para uma experiência fluida em ambos os lados.",
    icon: Smartphone
  },
  {
    title: "Sistema Fiscal",
    desc: "Emissão de notas e conformidade tributária simplificada.",
    icon: ShieldCheck
  },
  {
    title: "Performance Ultra",
    desc: "Tecnologia de ponta para carregamento instantâneo e sem travamentos.",
    icon: Zap
  },
  {
    title: "Gestão de Equipe",
    desc: "Controle de acessos e produtividade dos seus colaboradores.",
    icon: Users
  }
];

export default function Features() {
  return (
    <section id="features" className="py-28 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,211,238,0.04),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">Funcionalidades</h2>
          <h3 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">Tudo o que você precisa</h3>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto text-lg font-light">
            Uma plataforma completa, modular e pronta para escalar seu negócio independente do seu segmento de atuação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="bg-gradient-to-br from-zinc-900 via-cyan-950/40 to-zinc-900 border border-zinc-800/80 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:border-cyan-400/40 hover:scale-[1.02] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center mb-6 group-hover:bg-cyan-400 group-hover:text-black transition-all duration-300 shadow-lg">
                <feature.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">{feature.title}</h4>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
